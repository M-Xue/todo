use axum::{
    http::{Method, Uri},
    middleware,
    response::{IntoResponse, Response},
    Json, Router,
};
use serde_json::json;
use std::net::SocketAddr;

mod app_state;
mod controllers;
mod errors;
mod models;
mod routes;

use crate::app_state::AppState;
use crate::errors::client_error::Error;
use errors::to_do_error::ToDoError;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let app_state = AppState {
        db_conn: sqlx::postgres::PgPool::connect("postgres://maxxue@localhost:5432/todo").await?,
    };

    sqlx::migrate!("./migrations")
        .run(&app_state.db_conn)
        .await?;

    let api_routes = routes::routes_todo::routes(app_state);
    let app = Router::new()
        .nest("/api", api_routes)
        .layer(middleware::map_response(main_response_mapper));

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
    let service_error = res.extensions().get::<ToDoError>(); // TODO: need to make this more generic. Need to some how put the custom Error trait in here instead of a concrete struct type

    // -- If client error, build the new response
    let error_response = service_error.map(|se| {
        let (status_code, client_error) = se.client_status_and_error();
        let (error_message, error_detail) = se.get_error_info();
        let client_error_body = json!({
            "error": {
                "type": client_error.as_ref(),
                "message": error_message,
                "detail": error_detail,
                // TODO: Maybe just put tracing id (uuid) here instead of message and detail and you can check the logs for details instead of giving it to the client
            }
        });
        // Build the new response from the client_error_body
        (status_code, Json(client_error_body)).into_response()
    });
    error_response.unwrap_or(res)
}
