package vn.bevuimekhoe.shared.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.bevuimekhoe.booking.BookingConflictException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        String message = exception.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .orElse("Dữ liệu gửi lên chưa hợp lệ.");
        return ResponseEntity.badRequest().body(ApiError.of(400, "VALIDATION_ERROR", message, request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException exception, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(ApiError.of(400, "INVALID_PARAMETER",
            "Tham số " + exception.getName() + " không đúng định dạng.", request.getRequestURI()));
    }

    @ExceptionHandler(BookingConflictException.class)
    ResponseEntity<ApiError> handleConflict(BookingConflictException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError.of(409, "BOOKING_CONFLICT", exception.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    ResponseEntity<ApiError> handleNotFound(EmptyResultDataAccessException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of(404, "RESOURCE_NOT_FOUND", "Không tìm thấy dữ liệu phù hợp.", request.getRequestURI()));
    }

    @ExceptionHandler({IllegalStateException.class, DataIntegrityViolationException.class})
    ResponseEntity<ApiError> handleStateConflict(Exception exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError.of(409, "STATE_CONFLICT", "Dữ liệu đang xung đột với trạng thái hiện tại.", request.getRequestURI()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiError.of(400, "BAD_REQUEST", exception.getMessage(), request.getRequestURI()));
    }
}
