use sqlx::{Pool, Postgres};

#[derive(Clone, Copy)]
pub struct AppState {
    pub db_conn: Pool<Postgres>,
}
