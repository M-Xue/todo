use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use chrono::DateTime;
use futures::future::join_all;
use serde_json::{json, Value};
use uuid::Uuid;

use crate::app_state::AppState;
use crate::controllers::todo_controller::ToDoController;
use crate::errors::to_do_error::ToDoError;
use crate::models::todo::{AssignedToDate, ToDoItem, ToDoJson};

pub fn routes(app_state: AppState) -> Router {
    Router::new()
        .route("/todo/item", post(create_todo))
        .route("/todo/date/:date", get(get_date_todos))
        .route("/todo/item/:id", delete(delete_todo).get(get_todo)) // http://localhost:8080/api/todo/item/1
        .with_state(app_state)
}

async fn create_todo(
    State(app_state): State<AppState>,
    Json(new_item_data): Json<ToDoJson>,
) -> Result<(StatusCode, Json<Value>), ToDoError> {
    let new_id = ToDoController::create_todo_item(app_state, new_item_data).await?;
    let body = Json(json!({ "new_id": new_id }));
    Ok((StatusCode::CREATED, body))
}

async fn get_date_todos(
    Path(iso_string): Path<String>,
) -> Result<(StatusCode, Json<Value>), ToDoError> {
    let date = DateTime::parse_from_rfc3339(&iso_string).unwrap(); // TODO: Error
    println!("{:?}", date);
    todo!()
}

async fn delete_todo(Path(item_id): Path<Uuid>) {
    todo!()
}
async fn get_todo(Path(item_id): Path<Uuid>) {
    todo!()
}
