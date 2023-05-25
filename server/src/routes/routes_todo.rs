use axum::extract::{Path, State};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use chrono::DateTime;
use serde_json::{json, Value};
use uuid::Uuid;

use crate::app_state::AppState;
use crate::models::todo::{AssignedToDate, ToDoItem, ToDoJson};

pub fn routes(app_state: AppState) -> Router {
    Router::new()
        .route("/todo/item", post(create_todo))
        .route("/todo/date/:date", get(get_date_todo))
        // .route("/todo/item/:id", delete(delete_todo).get(get_todo)) // http://localhost:8080/api/todo/item/1
        .with_state(app_state)
}

async fn create_todo(State(app_state): State<AppState>, Json(new_item_data): Json<ToDoJson>) {
    println!("get_todo router");
    println!("{:?}", new_item_data);

    let new_item = ToDoItem {
        id: Uuid::new_v4(),
        title: new_item_data.title,
        complete: false,
        description: new_item_data.description,
    };

    let new_assigned_dates: Vec<AssignedToDate> = new_item_data
        .dates
        .iter()
        .map(|iso| {
            let date = DateTime::parse_from_rfc3339(iso).unwrap(); // TODO: throw a parse error here
            AssignedToDate {
                date,
                todo_item: new_item.id.clone(),
            }
        })
        .collect::<Vec<AssignedToDate>>();

    // new_item.create_item(app_state).await?; // TODO: Error

    // new_assigned_dates.into_iter().for_each(|date| async {
    //     date.create_assigned_date(app_state).await?; // TODO: Error
    // });
}

async fn get_date_todo(Path(iso_string): Path<String>) {
    let date = DateTime::parse_from_rfc3339(&iso_string).unwrap(); // TODO: Error
    println!("{:?}", date);
}

// async fn delete_todo(Path(item_id): Path<Uuid>) {}
// async fn get_todo(Path(item_id): Path<Uuid>) {}
