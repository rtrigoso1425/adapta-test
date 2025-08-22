import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import careerService from "./careerService";

const initialState = {
  careers: [],
  myCareer: null,
  isLoading: false,
  isError: false,
  message: "",
};

// Async Thunks
export const getCareers = createAsyncThunk(
  "careers/getAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await careerService.getCareers(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createCareer = createAsyncThunk(
  "careers/create",
  async (careerData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await careerService.createCareer(careerData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const assignCoordinator = createAsyncThunk(
  "careers/assignCoordinator",
  async ({ careerId, userId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await careerService.assignCoordinator(careerId, userId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMyCareer = createAsyncThunk(
  "careers/getMyCareer",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await careerService.getMyCareer(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addCourseToCurriculum = createAsyncThunk(
  "careers/addCourse",
  async ({ careerId, courseData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await careerService.addCourseToCurriculum(
        careerId,
        courseData,
        token
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCareerById = createAsyncThunk(
  "careers/getById",
  async (careerId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await careerService.getCareerById(careerId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const careerSlice = createSlice({
  name: "careers",
  initialState,
  reducers: {
    // eslint-disable-next-line no-unused-vars
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCareers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCareers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.careers = action.payload;
      })
      .addCase(getCareers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createCareer.fulfilled, (state, action) => {
        state.careers.push(action.payload);
      })
      .addCase(assignCoordinator.fulfilled, (state, action) => {
        const index = state.careers.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.careers[index] = action.payload;
        }
      })
      .addCase(getMyCareer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyCareer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myCareer = action.payload;
      })
      .addCase(getMyCareer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addCourseToCurriculum.fulfilled, (state, action) => {
        // Actualizamos myCareer con la nueva malla curricular devuelta por la API
        state.myCareer = action.payload;
      })
      .addCase(getCareerById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCareerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myCareer = action.payload; // Reutilizamos 'myCareer' para la carrera individual
      });
  },
});

export const { reset } = careerSlice.actions;
export default careerSlice.reducer;
