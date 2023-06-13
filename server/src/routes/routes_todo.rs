use std::str::FromStr;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, patch, post, put};
use axum::{Json, Router};
use chrono::DateTime;
use serde_json::{json, Value};
use uuid::Uuid;

use crate::app_state::AppState;
use crate::controllers::todo_controller::ToDoController;
use crate::errors::to_do_error::ToDoError;
use crate::models::todo::{
    RequestCreateToDoItem, RequestUpdateToDoItemCompleted, RequestUpdateToDoItemRank,
    ResponseGetToDoByDate,
};

pub fn routes(app_state: AppState) -> Router {
    Router::new()
        .route("/todo/item", post(create_todo))
        .route("/todo/date/:date", get(get_todos_by_date))
        // .route("/todo/item/:id", delete(delete_todo).get(get_todo)) // http://localhost:8080/api/todo/item/1
        .route(
            "/todo/item_completed/:id",
            patch(update_todo_item_completion_status),
        ) // http://localhost:8080/api/todo/item/1
        .route("/todo/re_rank_item", put(update_todo_item_rank))
        .with_state(app_state)
}

async fn create_todo(
    State(app_state): State<AppState>,
    Json(new_item_data): Json<RequestCreateToDoItem>,
) -> Result<(StatusCode, Json<Value>), ToDoError> {
    let new_id = ToDoController::create_todo_item(app_state, new_item_data).await?;
    let body = Json(json!({ "new_id": new_id }));
    Ok((StatusCode::CREATED, body))
}

#[axum_macros::debug_handler]
async fn get_todos_by_date(
    State(app_state): State<AppState>,
    Path(iso_string): Path<String>,
) -> Result<(StatusCode, Json<ResponseGetToDoByDate>), ToDoError> {
    let date = DateTime::parse_from_rfc3339(&iso_string);
    if let Ok(date) = date {
        let res = ToDoController::get_items_by_date(app_state, date).await;

        match res {
            Ok(items) => Ok((StatusCode::OK, Json(ResponseGetToDoByDate { items }))),
            Err(err) => Err(err),
        }
    } else {
        Err(ToDoError::Iso8601ParseError)
    }
}

async fn update_todo_item_completion_status(
    State(app_state): State<AppState>,
    Path(item_id): Path<Uuid>,
    Json(data): Json<RequestUpdateToDoItemCompleted>,
) -> Result<(StatusCode, ()), ToDoError> {
    ToDoController::update_todo_item_completion_status(app_state, item_id, data.completed).await?;
    Ok((StatusCode::NO_CONTENT, ())) // TODO: Should this be no content? Maybe send back the updated body?
}

async fn update_todo_item_rank(
    State(app_state): State<AppState>,
    Json(data): Json<RequestUpdateToDoItemRank>,
) -> Result<(StatusCode, ()), ToDoError> {
    let date = DateTime::parse_from_rfc3339(&data.iso_string);
    if let Ok(date) = date {
        ToDoController::update_todo_item_rank(app_state, date, data.item_id, data.new_rank).await?;
        Ok((StatusCode::NO_CONTENT, ())) // TODO: Should this be no content? Maybe send back the updated body?
    } else {
        Err(ToDoError::Iso8601ParseError)
    }
}

// async fn delete_todo(Path(item_id): Path<Uuid>) {
//     todo!()
// }
// async fn get_todo(Path(item_id): Path<Uuid>) {
//     todo!()
// }
