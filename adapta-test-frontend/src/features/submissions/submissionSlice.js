import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import submissionService from "./submissionService";

const initialState = {
  submissions: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

export const createSubmission = createAsyncThunk(
  "submissions/create",
  async ({ sectionId, assignmentId, submissionData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // Pasamos los argumentos al servicio en el orden correcto
      return await submissionService.createSubmission(
        sectionId,
        assignmentId,
        submissionData,
        token
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getSubmissionsForAssignment = createAsyncThunk('submissions/getForAssignment', async ({ sectionId, assignmentId }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        // Pasamos ambos IDs al servicio
        return await submissionService.getSubmissionsForAssignment(sectionId, assignmentId, token);
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const gradeSubmission = createAsyncThunk(
  "submissions/grade",
  async ({ submissionId, gradeData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await submissionService.gradeSubmission(
        submissionId,
        gradeData,
        token
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const submissionSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    // eslint-disable-next-line no-unused-vars
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSubmission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.submissions.push(action.payload);
        alert("¡Tarea entregada exitosamente!");
      })
      .addCase(createSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        alert("Error al entregar la tarea: " + action.payload);
      })
      .addCase(getSubmissionsForAssignment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubmissionsForAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload;
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        // Actualizamos la entrega que acaba de ser calificada en nuestro estado local
        const index = state.submissions.findIndex(
          (sub) => sub._id === action.payload._id
        );
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
        alert("Calificación guardada exitosamente.");
      });
  },
});

export const { reset } = submissionSlice.actions;
export default submissionSlice.reducer;
