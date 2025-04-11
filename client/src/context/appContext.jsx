import React, { createContext, useContext, useReducer } from "react";
import axios from 'axios';

import {
  CLEAR_ALERT,
  DISPLAY_ALERT,
  REGISTER_USER_BEGIN,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_ERROR,
  LOGIN_USER_BEGIN,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  UPDATE_USER_BEGIN,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  TOGGLE_SIDEBAR,
  LOGOUT_USER,
  HANDLE_CHANGE,
  CLEAR_VALUES,
  CREATE_JOB_BEGIN,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  GET_JOBS_BEGIN,
  GET_JOBS_SUCCESS,
  SET_EDIT_JOB,
  EDIT_JOB_BEGIN,
  EDIT_JOB_SUCCESS,
  EDIT_JOB_ERROR,
  DELETE_JOB_BEGIN,
  SHOW_STATS_BEGIN,
  SHOW_STATS_SUCCESS,
  CLEAR_FILTERS,
  CHANGE_PAGE,
} from "./actions";
import reducer from "./reducer";

// Removed duplicate BASE_URL declaration
// ----------Local Storage------------- //
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
const userLocation = localStorage.getItem("location");

const initialState = {
  isLoading: false,
  showAlert: false,
  alertText: "",
  alertType: "",
  user: user ? user : null,
  token: token,
  userLocation: userLocation || "",
  showSidebar: false,
  isEditing: false,
  editJobId: "",
  position: "",
  company: "",
  jobLocation: userLocation || "",
  jobTypeOptions: ["full-time", "part-time", "remote", "internship"],
  jobType: "full-time",
  statusOptions: ["interview", "declined", "pending"],
  status: "pending",
  jobs: [],
  totalJobs: 0,
  numOfPages: 1,
  page: 1,
  stats: {},
  monthlyApplications: [],
  search: "",
  searchStatus: "all",
  searchType: "all",
  sort: "latest",
  sortOptions: ["latest", "oldest", "a-z", "z-a"],
};

const AppContext = createContext();


const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // -------------------axios---------------------- //
  const authFetch = axios.create({
    baseURL: "https://cuvette-backend-7jzf.onrender.com/api/v1", // Use the correct BASE_URL directly
    withCredentials: true,
  });

  authFetch.interceptors.request.use(
    (config) => {
      config.headers.common["Authorization"] = `Bearer ${state.token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  authFetch.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        logoutUser();
      }
      return Promise.reject(error);
    }
  );

  // ----------Dispatching Actions------------- //
  const displayAlert = () => {
    dispatch({ type: DISPLAY_ALERT });
    clearAlert();
  };
  const clearAlert = () => {
    setTimeout(() => {
      dispatch({ type: CLEAR_ALERT });
    }, 3000);
  };

  // ----------Local Storage------------- //
  const addUserToLocalStorage = ({ user, token, location }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("location", location);
  };
  const removeUserFromLocalStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("location");
  };

// ✅ CORRECT BASE URL (MUST INCLUDE /api/v1)
const BASE_URL = "https://cuvette-backend-7jzf.onrender.com/api/v1";

const registerUser = async (currentUser) => {
  dispatch({ type: REGISTER_USER_BEGIN });
  try {
    // ✅ Verified endpoint: /api/v1/auth/register
    const response = await axios.post(
      `${BASE_URL}/auth/register`,
      currentUser,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      }
    );

    const { user, token, location } = response.data;
    dispatch({ type: REGISTER_USER_SUCCESS, payload: { user, token, location } });
    addUserToLocalStorage({ user, token, location });
    
  } catch (error) {
    // ✅ Enhanced error handling
    const errorMessage = error.response?.data?.msg || 
      `Registration failed: ${error.message || 'Server unreachable'}`;
    dispatch({ type: REGISTER_USER_ERROR, payload: { msg: errorMessage } });
  }
  clearAlert();
};

const loginUser = async (currentUser) => {
  dispatch({ type: LOGIN_USER_BEGIN });
  try {
    // ✅ Verified endpoint: /api/v1/auth/login
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      currentUser,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      }
    );

    const { user, token, location } = response.data;
    dispatch({ type: LOGIN_USER_SUCCESS, payload: { user, token, location } });
    addUserToLocalStorage({ user, token, location });
    
  } catch (error) {
    const errorMessage = error.response?.data?.msg || 
      `Login failed: ${error.message || 'Check network connection'}`;
    dispatch({ type: LOGIN_USER_ERROR, payload: { msg: errorMessage } });
  }
  clearAlert();
};
  const updateUser = async (currentUser) => {
    dispatch({ type: UPDATE_USER_BEGIN });
    try {
      const { data } = await authFetch.patch("/auth/updateUser", currentUser);
      const { user, location, token } = data;

      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: { user, location, token },
      });
      addUserToLocalStorage({ user, location, token });
    } catch (error) {
      if (error.response.status !== 401) {
        dispatch({
          type: UPDATE_USER_ERROR,
          payload: { msg: error.response.data.msg },
        });
      }
    }
    clearAlert();
  };

  const toggleSidebar = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };
  const logoutUser = () => {
    dispatch({ type: LOGOUT_USER });
    removeUserFromLocalStorage();
  };

  const handleChange = ({ name, value }) => {
    dispatch({ type: HANDLE_CHANGE, payload: { name, value } });
  };
  const clearValues = () => {
    dispatch({ type: CLEAR_VALUES });
  };
  const createJob = async () => {
    dispatch({ type: CREATE_JOB_BEGIN });

    try {
      const { position, company, jobLocation, jobType, status } = state;

      await authFetch.post("/jobs", {
        company,
        position,
        jobLocation,
        jobType,
        status,
      });
      dispatch({
        type: CREATE_JOB_SUCCESS,
      });

      dispatch({ type: CLEAR_VALUES });
    } catch (error) {
      if (error.response.status === 401) return;
      dispatch({
        type: CREATE_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }

    clearAlert();
  };

  const getJobs = async () => {
    const { page, search, searchStatus, searchType, sort } = state;
    let url = `/jobs?page=${page}&status=${searchStatus}&jobType=${searchType}&sort=${sort}`;
    if (search) {
      url = url + `&search=${search}`;
    }

    dispatch({ type: GET_JOBS_BEGIN });

    try {
      const { data } = await authFetch(url);
      const { jobs, totalJobs, numOfPages } = data;

      dispatch({
        type: GET_JOBS_SUCCESS,
        payload: {
          jobs,
          totalJobs,
          numOfPages,
        },
      });
    } catch (error) {
      logoutUser();
    }

    clearAlert();
  };

  const setEditJob = (id) => {
    dispatch({ type: SET_EDIT_JOB, payload: { id } });
  };

  const editJob = async () => {
    dispatch({ type: EDIT_JOB_BEGIN });
    try {
      const { position, company, jobLocation, jobType, status } = state;

      await authFetch.patch(`/jobs/${state.editJobId}`, {
        company,
        position,
        jobLocation,
        jobType,
        status,
      });
      dispatch({
        type: EDIT_JOB_SUCCESS,
      });
      dispatch({ type: CLEAR_VALUES });
    } catch (error) {
      if (error.response.status === 401) return;
      dispatch({
        type: EDIT_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
  };

  const deleteJob = async (jobId) => {
    dispatch({ type: DELETE_JOB_BEGIN });
    try {
      await authFetch.delete(`/jobs/${jobId}`);
      getJobs();
    } catch (error) {
      logoutUser();
    }
  };

  const showStats = async () => {
    dispatch({ type: SHOW_STATS_BEGIN });
    try {
      const { data } = await authFetch("/jobs/stats");
      dispatch({
        type: SHOW_STATS_SUCCESS,
        payload: {
          stats: data.defaultStats,
          monthlyApplications: data.monthlyApplications,
        },
      });
    } catch (error) {
      console.log(error.response);
      logoutUser();
    }

    clearAlert();
  };

  const clearFilters = () => {
    dispatch({ type: CLEAR_FILTERS });
  };

  const changePage = (page) => {
    dispatch({ type: CHANGE_PAGE, payload: { page } });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        displayAlert,
        registerUser,
        loginUser,
        toggleSidebar,
        logoutUser,
        updateUser,
        handleChange,
        clearValues,
        createJob,
        getJobs,
        setEditJob,
        editJob,
        deleteJob,
        showStats,
        clearFilters,
        changePage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { AppProvider, initialState, useAppContext };
