use axum::{
    http::{Method, Uri},
    middleware,
    response::{IntoResponse, Response},
    Json, Router,
};
use http::header::CONTENT_TYPE;
use serde_json::json;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

mod app_state;
mod controllers;
mod errors;
mod logger;
mod models;
mod routes;

use crate::app_state::AppState;
use crate::errors::client_error::Error;
use errors::to_do_error::ToDoError;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    let app_state = AppState {
        db_conn: sqlx::postgres::PgPool::connect("postgres://maxxue@localhost:5432/todo").await?,
    };

    sqlx::migrate!("./migrations")
        .run(&app_state.db_conn)
        .await?;

    sqlx::query("delete from AssignedToDate")
        .execute(&app_state.db_conn)
        .await?;
    sqlx::query("delete from ToDoItem cascade")
        .execute(&app_state.db_conn)
        .await?;

    let cors = CorsLayer::new()
        .allow_headers([CONTENT_TYPE])
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::PUT])
        .allow_origin(Any);

    let api_routes = routes::routes_todo::routes(app_state);
    let app = Router::new()
        .nest("/api", api_routes)
        .layer(middleware::map_response(main_response_mapper))
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("->> LISTENING on {addr}\n");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}

async fn main_response_mapper(uri: Uri, req_method: Method, res: Response) -> Response {
    // -- Get the eventual response error
    let service_error = res.extensions().get::<Box<dyn Error + Send + Sync>>();

    // -- If client error, build the new response
    if let Some(res_error) = service_error {
        let (status_code, client_error) = res_error.client_status_and_error();
        let (error_message, error_detail) = res_error.get_error_info();
        let error_id = Uuid::new_v4();

        let log_error_body = json!({
            "error_id": error_id,
            "message": error_message,
            "detail": error_detail,
            "req_method": req_method.to_string(),
            "uri": uri.to_string(),
        });
        log::error!(" - {}", log_error_body);

        let client_error_body = json!({
            "error": {
                "type": client_error.as_ref(),
                "error_id": error_id,
            }
        });
        // Build the new response from the client_error_body
        (status_code, Json(client_error_body)).into_response()
    } else {
        res
    }
}
