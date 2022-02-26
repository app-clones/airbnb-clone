import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
    if (err.inner.length > 0) {
        return err.inner.map((e) => {
            return { path: e.path!, message: e.message };
        });
    } else {
        return [{ path: err.path!, message: err.message }];
    }
};
