use sqlx::{Pool, Postgres};

#[derive(Clone)]
pub struct AppState {
    pub db_conn: Pool<Postgres>,
}
