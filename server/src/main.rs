use axum::Router;
use std::net::SocketAddr;

mod app_state;
mod controllers;
mod errors;
mod models;
mod routes;

use crate::app_state::AppState;

use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // TODO: Error above ^^^
    let app_state = AppState {
        db_conn: sqlx::postgres::PgPool::connect("postgres://maxxue@localhost:5432/todo").await?,
    };

    sqlx::migrate!("./migrations")
        .run(&app_state.db_conn)
        .await?;

    let api_routes = routes::routes_todo::routes(app_state);
    let app = Router::new().nest("/api", api_routes);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("->> LISTENING on {addr}\n");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    Ok(())
}
