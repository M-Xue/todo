use axum::http::StatusCode;
use thiserror::Error;

pub trait Error {
    // Get error detail, message and status code for client response
    fn client_status_and_error(&self) -> (StatusCode, ClientError);
    // Get error detail and message for logging
    fn get_error_info(&self) -> (String, String);
}

#[derive(Error, Debug, strum_macros::AsRefStr)]
#[allow(non_camel_case_types)]
pub enum ClientError {
    // LOGIN_FAIL,
    // NO_AUTH,
    // INVALID_PARAMS,
    #[error("Internal Service Error")]
    SERVICE_ERROR,
}
