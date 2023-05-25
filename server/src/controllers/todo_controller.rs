use axum::Json;
use chrono::DateTime;
use futures::future::join_all;
use uuid::Uuid;

use crate::{
    app_state::AppState,
    errors::to_do_error::ToDoError,
    models::todo::{AssignedToDate, ToDoItem, ToDoJson},
};

pub struct ToDoController {}
impl ToDoController {
    pub async fn create_todo_item(
        app_state: AppState,
        new_item_data: ToDoJson,
    ) -> Result<Uuid, ToDoError> {
        let new_item = ToDoItem {
            id: Uuid::new_v4(),
            title: new_item_data.title.clone(),
            complete: false,
            description: new_item_data.description.clone(),
        };

        let new_assigned_dates: Result<Vec<AssignedToDate>, ToDoError> = new_item_data
            .dates
            .iter()
            .map(|iso| {
                let date = match DateTime::parse_from_rfc3339(iso) {
                    Ok(d) => d,
                    Err(parse_err) => return Err(ToDoError::from(parse_err)),
                };
                Ok(AssignedToDate {
                    date,
                    todo_item: new_item.id.clone(),
                })
            })
            .collect();

        let new_id = new_item.create_item(&app_state).await?; // This needs to go before the create_assigned_date() futures are executed or there won't be a to do row for foreign keys to point to

        match new_assigned_dates {
            Ok(dates) => {
                match AssignedToDate::create_assigned_dates(&app_state, dates).await {
                    Ok(_) => (),
                    Err(db_err) => {
                        let _ = ToDoItem::delete_item(&app_state, new_id).await; // If the batch creation of new assigned dates doesn't go through, delete the new item
                        return Err(db_err);
                    }
                };
            }
            Err(err) => return Err(err),
        };

        Ok(new_id)
    }
}
