use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, patch, post, put};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::app_state::AppState;
use crate::controllers::todo_controller::ToDoController;
use crate::errors::to_do_error::ToDoError;
use crate::models::todo::ToDoItemWithRank;

// **********************************************
// * REQUEST/RESPONSE TYPES
// **********************************************

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
#[derive(Debug, Deserialize)]
pub struct RequestUpdateToDoItemCompleted {
    pub completed: bool,
}

#[typeshare::typeshare]
#[derive(Debug, Serialize)]
pub struct ResponseGetToDoByDate {
    pub items: Vec<ToDoItemWithRank>,
}

// **********************************************
// * ROUTES
// **********************************************

pub fn routes(app_state: AppState) -> Router {
    Router::new()
        .route("/todo/item", post(create_to_do))
        .route("/todo/date/:date", get(get_to_dos_by_date))
        // .route("/todo/item/:id", delete(delete_todo).get(get_todo)) // http://localhost:8080/api/todo/item/1
        .route(
            "/todo/item_completed/:id",
            patch(update_to_do_completion_status),
        ) // http://localhost:8080/api/todo/item/1
        .route("/todo/re_rank_item", put(update_to_do_rank))
        .with_state(app_state)
}

async fn create_to_do(
    State(app_state): State<AppState>,
    Json(new_item_data): Json<RequestCreateToDoItem>,
) -> Result<(StatusCode, Json<Value>), ToDoError> {
    let new_id = ToDoController::create_to_do(
        app_state,
        new_item_data.title,
        new_item_data.description,
        new_item_data.dates,
    )
    .await?;
    Ok((StatusCode::CREATED, Json(json!({ "new_id": new_id }))))
}

#[axum_macros::debug_handler]
async fn get_to_dos_by_date(
    State(app_state): State<AppState>,
    Path(iso_string): Path<String>,
) -> Result<(StatusCode, Json<ResponseGetToDoByDate>), ToDoError> {
    let items = ToDoController::get_to_dos_by_date(app_state, iso_string).await?;
    Ok((StatusCode::OK, Json(ResponseGetToDoByDate { items })))
}

async fn update_to_do_completion_status(
    State(app_state): State<AppState>,
    Path(item_id): Path<Uuid>,
    Json(data): Json<RequestUpdateToDoItemCompleted>,
) -> Result<(StatusCode, ()), ToDoError> {
    ToDoController::update_to_do_completion_status(app_state, item_id, data.completed).await?;
    Ok((StatusCode::NO_CONTENT, ())) // TODO: Should this be no content? Maybe send back the updated body?
}

async fn update_to_do_rank(
    State(app_state): State<AppState>,
    Json(data): Json<RequestUpdateToDoItemRank>,
) -> Result<(StatusCode, ()), ToDoError> {
    ToDoController::update_to_do_rank(app_state, data.iso_string, data.item_id, data.new_rank)
        .await?;
    Ok((StatusCode::NO_CONTENT, ())) // TODO: Should this be no content? Maybe send back the updated body?
}

// async fn delete_todo(Path(item_id): Path<Uuid>) {
//     todo!()
// }
// async fn get_todo(Path(item_id): Path<Uuid>) {
//     todo!()
// }
