use chrono::{DateTime, FixedOffset};
use uuid::Uuid;

use crate::{
    app_state::AppState,
    errors::to_do_error::ToDoError,
    models::todo::{AssignedToDate, RequestCreateToDoItem, ToDoItem, ToDoItemWithRank},
};

pub struct ToDoController {}
impl ToDoController {
    pub async fn create_to_do(
        app_state: AppState,
        title: String,
        description: String,
        dates: Vec<Vec<String>>,
    ) -> Result<Uuid, ToDoError> {
        let new_item = ToDoItem {
            id: Uuid::new_v4(),
            title,
            complete: false,
            description,
        };

        let new_assigned_dates: Result<Vec<AssignedToDate>, ToDoError> = dates
            .iter()
            .map(|date_rank| {
                let iso = match date_rank.get(0) {
                    Some(iso) => iso,
                    None => Err(ToDoError::CreateToDoParamError("Iso8061 Date".to_string()))?,
                };
                let rank = match date_rank.get(1) {
                    Some(rank) => rank,
                    None => Err(ToDoError::CreateToDoParamError("Rank".to_string()))?,
                };

                let date = match DateTime::parse_from_rfc3339(iso) {
                    Ok(d) => d,
                    Err(parse_err) => return Err(ToDoError::from(parse_err)),
                };
                Ok(AssignedToDate {
                    date,
                    todo_item: new_item.id.clone(),
                    rank: rank.clone(),
                })
            })
            .collect();

        let new_id = new_item.create_item(&app_state).await?;

        match new_assigned_dates {
            Ok(dates) => {
                if let Err(db_err) = AssignedToDate::create_assigned_dates(&app_state, dates).await
                {
                    let _ = ToDoItem::delete_item(&app_state, new_id).await; // If the batch creation of new assigned dates doesn't go through, delete the new item
                    return Err(db_err);
                }
            }
            Err(err) => {
                let _ = ToDoItem::delete_item(&app_state, new_id).await;
                return Err(err);
            }
        }

        Ok(new_id)
    }

    pub async fn get_to_dos_by_date(
        app_state: AppState,
        iso_string: String,
    ) -> Result<Vec<ToDoItemWithRank>, ToDoError> {
        let date = DateTime::parse_from_rfc3339(&iso_string);
        if let Ok(date) = date {
            AssignedToDate::get_items_by_date(app_state, date).await
        } else {
            Err(ToDoError::Iso8601ParseError)
        }
    }

    pub async fn update_to_do_completion_status(
        app_state: AppState,
        item_id: Uuid,
        completed: bool,
    ) -> Result<(), ToDoError> {
        ToDoItem::update_item_completed(&app_state, item_id, completed).await
    }

    pub async fn update_to_do_rank(
        app_state: AppState,
        iso_string: String,
        item_id: Uuid,
        new_rank: String,
    ) -> Result<(), ToDoError> {
        let date = DateTime::parse_from_rfc3339(&iso_string);
        if let Ok(date) = date {
            AssignedToDate::update_todo_item_rank(&app_state, date, item_id, new_rank).await
        } else {
            Err(ToDoError::Iso8601ParseError)
        }
    }
}
