use crate::errors::to_do_error::ToDoError;
use crate::AppState;
use chrono::{DateTime, FixedOffset, Utc};
use serde::{Deserialize, Serialize};
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
    pub async fn create_item(self, app_state: AppState) -> Result<Uuid, ToDoError> {
        todo!()
    }
}

impl AssignedToDate {
    pub async fn create_assigned_date(self, app_state: AppState) -> Result<(), ToDoError> {
        todo!()
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
