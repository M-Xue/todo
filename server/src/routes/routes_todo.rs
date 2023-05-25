use axum::extract::{Path, State};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use chrono::DateTime;
use futures::future::join_all;
use serde_json::{json, Value};
use uuid::Uuid;

use crate::app_state::AppState;
use crate::errors::to_do_error::ToDoError;
use crate::models::todo::{AssignedToDate, ToDoItem, ToDoJson};

pub fn routes(app_state: AppState) -> Router {
    Router::new()
        .route("/todo/item", post(create_todo))
        .route("/todo/date/:date", get(get_date_todo))
        // .route("/todo/item/:id", delete(delete_todo).get(get_todo)) // http://localhost:8080/api/todo/item/1
        .with_state(app_state)
}

async fn create_todo(
    State(app_state): State<AppState>,
    Json(new_item_data): Json<ToDoJson>,
) -> Result<Json<Value>, ToDoError> {
    println!("get_todo router");
    println!("{:?}", new_item_data);

    let new_item = ToDoItem {
        id: Uuid::new_v4(),
        title: new_item_data.title,
        complete: false,
        description: new_item_data.description,
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

    let mut futures = Vec::new();

    match new_assigned_dates {
        Ok(dates) => {
            dates.into_iter().for_each(|date| {
                futures.push(date.create_assigned_date(app_state));
            });
        }
        Err(err) => return Err(err),
    };
    join_all(futures).await?;

    let new_id = new_item.create_item(app_state).await?;

    let body = Json(json!({
        "result": {
            "success": true,
            "new_id": new_id
        }
    }));
    Ok(body)
}

async fn get_date_todo(Path(iso_string): Path<String>) {
    let date = DateTime::parse_from_rfc3339(&iso_string).unwrap(); // TODO: Error
    println!("{:?}", date);
}

async fn delete_todo(Path(item_id): Path<Uuid>) {
    todo!()
}
async fn get_todo(Path(item_id): Path<Uuid>) {
    todo!()
}
