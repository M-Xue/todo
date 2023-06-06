use crate::errors::to_do_error::ToDoError;
use crate::AppState;
use axum::response::IntoResponse;
use axum::response::Response;
use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Postgres, QueryBuilder, Row};
use uuid::Uuid;

// pub struct Date {
//     date: DateTime<Utc>,
// }

// // For a particular to do item on a given date, it may have multiple time blocks associated with it. You cannot have overlapping items for a given time. 15 minute increments.
// // https://www.postgresql.org/docs/current/functions-datetime.html
// // Check for timeblock conflics on the backend when entering them manually from calendar view but check it on the front end/backend when in day view
// pub struct TimeBlock {
//     date: DateTime<Utc>,
//     todo_item: Uuid,
//     time_block: DateTime<Utc>,
// }

// * Probably don't want a date table because you will need to make a row for every date in existence
// This struct does not represent a date. It represents the information of a to do item for a given date.
pub struct AssignedToDate {
    // Given a date, you can see all the blocks of time it will be done in a vex as well as its lexorank order
    pub date: DateTime<FixedOffset>,
    pub todo_item: Uuid,
    pub rank: String,
}

#[typeshare::typeshare]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct ToDoItem {
    pub id: Uuid,
    pub title: String,
    pub complete: bool,
    pub description: String, // Make this markdown later
}

#[typeshare::typeshare]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct ToDoItemWithRank {
    pub id: Uuid,
    pub title: String,
    pub complete: bool,
    pub rank: String,
}

#[typeshare::typeshare]
#[derive(Debug, Deserialize)]
pub struct RequestCreateToDoItem {
    pub title: String,
    pub description: String,     // Make this markdown later
    pub dates: Vec<Vec<String>>, // The inner vector should just be of length 2 for every entry. First string is the ISO date string and the second is the rank
}

#[typeshare::typeshare]
#[derive(Debug, Deserialize)]
pub struct RequestUpdateToDoItemRank {
    pub iso_string: String,
    pub item_id: Uuid,
    pub new_rank: String,
}

#[typeshare::typeshare]
#[derive(Debug, Serialize)]
pub struct ResponseGetToDoByDate {
    pub items: Vec<ToDoItemWithRank>,
}

#[typeshare::typeshare]
#[derive(Debug, Deserialize)]
pub struct RequestUpdateToDoItemCompleted {
    pub completed: bool,
}

impl ToDoItem {
    pub async fn create_item(self, app_state: &AppState) -> Result<Uuid, ToDoError> {
        let query = "insert into ToDoItem (id, title, complete, description) values ($1, $2, $3, $4) returning id";
        let res = sqlx::query(query)
            .bind(self.id)
            .bind(self.title)
            .bind(self.complete)
            .bind(self.description)
            .fetch_one(&app_state.db_conn)
            .await;
        match res {
            Ok(row) => Ok(row.get("id")),
            Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
        }
    }
    pub async fn delete_item(app_state: &AppState, item_id: Uuid) -> Result<Uuid, ToDoError> {
        let query = "delete from ToDoItem where id = ($1)";
        let query_res = sqlx::query(query)
            .bind(item_id)
            .execute(&app_state.db_conn)
            .await;
        match query_res {
            Ok(_) => Ok(item_id),
            Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
        }
    }
    pub async fn update_item_completed(
        app_state: &AppState,
        item_id: Uuid,
        completed: bool,
    ) -> Result<(), ToDoError> {
        let query = "update ToDoItem set complete = $1 where id = $2";
        let query_res = sqlx::query(query)
            .bind(completed)
            .bind(item_id)
            .execute(&app_state.db_conn)
            .await;
        match query_res {
            Ok(_) => Ok(()),
            Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
        }
    }
}

impl AssignedToDate {
    pub async fn create_assigned_dates(
        app_state: &AppState,
        dates: Vec<AssignedToDate>,
    ) -> Result<(), ToDoError> {
        let mut query_builder: QueryBuilder<Postgres> =
            QueryBuilder::new("insert into AssignedToDate (to_do_item, date, rank) ");

        query_builder.push_values(dates.into_iter(), |mut b, date| {
            b.push_bind(date.todo_item)
                .push_bind(date.date.date_naive())
                .push_bind(date.rank);
        });

        let query = query_builder.build();
        let query_res = query.execute(&app_state.db_conn).await;
        match query_res {
            Ok(_) => Ok(()),
            Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
        }
    }

    pub async fn get_items_by_date(
        app_state: AppState,
        date: DateTime<FixedOffset>,
    ) -> Result<Vec<ToDoItemWithRank>, ToDoError> {
        let query =
            "select i.id, i.title, i.complete, i.description, d.rank from ToDoItem i join AssignedToDate d on (i.id = d.to_do_item) where d.date = ($1)";

        let query = sqlx::query_as::<Postgres, ToDoItemWithRank>(query);
        let query_res = query
            .bind(date.date_naive())
            .fetch_all(&app_state.db_conn)
            .await;

        match query_res {
            Ok(items) => Ok(items),
            Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
        }
    }

    pub async fn update_todo_item_rank(
        app_state: &AppState,
        date: DateTime<FixedOffset>,
        item_id: Uuid,
        new_rank: String,
    ) -> Result<(), ToDoError> {
        let query = "update AssignedToDate set rank = $1 where id = $2 and date = $3";
        let query_res = sqlx::query(query)
            .bind(new_rank)
            .bind(item_id)
            .bind(date.date_naive())
            .execute(&app_state.db_conn)
            .await;
        match query_res {
            Ok(_) => Ok(()),
            Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
        }
    }
}

// pub async fn reorder_item(&self, app_state: AppState, id: Uuid, date: DateTime<Utc>,) {}
// pub async fn get_item(&self, app_state: AppState, id: Uuid) -> ToDoItem {}
