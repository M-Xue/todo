use crate::errors::to_do_error::ToDoError;
use crate::AppState;
use chrono::{DateTime, FixedOffset, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Postgres, QueryBuilder, Row};
use uuid::Uuid;

// pub struct Date {
//     date: DateTime<Utc>,
// }

// // For a particular to do item on a given date, it may have multiple time blocks associated with it. You cannot have overlapping items for a given time. 15 minute increments.
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
    // pub lexorank: String,
}

pub struct ToDoItem {
    pub id: Uuid,
    pub title: String,
    pub complete: bool,
    pub description: String, // Make this markdown later
}

#[derive(Debug, Deserialize)]
pub struct ToDoJson {
    pub title: String,
    pub description: String, // Make this markdown later
    pub dates: Vec<String>,
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
        let res = sqlx::query(query)
            .bind(item_id)
            .execute(&app_state.db_conn)
            .await;
        match res {
            Ok(row) => Ok(item_id),
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
            QueryBuilder::new("insert into AssignedToDate (to_do_item, date) ");

        query_builder.push_values(dates.into_iter(), |mut b, date| {
            b.push_bind(date.todo_item)
                .push_bind(date.date.date_naive());
        });

        let query = query_builder.build();
        let res = query.execute(&app_state.db_conn).await;
        match res {
            Ok(_) => Ok(()),
            Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
        }
    }
}

// pub async fn reorder_item(&self, app_state: AppState, id: Uuid, date: DateTime<Utc>,) {
//     todo!()
// }

// pub async fn get_item(&self, app_state: AppState, id: Uuid) -> ToDoItem {
//     todo!()
// }

// pub async fn get_items_by_date(
//     &self,
//     app_state: AppState,
//     date: DateTime<FixedOffset>,
// ) -> Vec<ToDoItem> {
//     let query = "
//         select *
//         from ToDoItem i
//             join AssignedToDate d on (i.id = d.to_do_item)
//         d.date = $1
//     ";

//     // sqlx::query(query)
//     //     .bind(&date)
//     //     .execute(&app_state.db_conn)
//     //     .await?;

//     todo!()
// }

// ** VALID FUNCTION
// pub async fn create_assigned_date(self, app_state: AppState) -> Result<(), ToDoError> {
//     let query = "insert into AssignedToDate (to_do_item, date) values ($1, $2)";
//     let res = sqlx::query(query)
//         .bind(self.todo_item)
//         .bind(self.date.date_naive())
//         .execute(&app_state.db_conn)
//         .await;
//     match res {
//         Ok(_) => Ok(()),
//         Err(db_err) => Err(ToDoError::DatabaseError(db_err)),
//     }
// }
// *****
