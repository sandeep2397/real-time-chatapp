/*
©2022 Pivotree | All rights reserved
*/
import {
  CACHE_MEDIA_DATA,
  COMMON_ACTION,
  COMMON_ACTION_FAILED,
  COMMON_ACTION_SUCCESS,
  CURRENT_SELECTED_PERSON,
  SAVE_CONTACTS,
  SAVE_LOGGED_IN_DATA,
  SAVE_MENU_STATE,
  SAVE_SOCKET,
  SET_FIELDS_JSON,
  SET_FIELDS_STATE,
  SET_STEPPER_STATE,
  TOGGLE_SESSION_PROMPT,
  TOGGLE_SNACKBAR,
} from "../../constants/actionTypes";
type CommonAction = { type: string; payload: {} | string };

export const saveMenuState = (data: string): CommonAction => ({
  type: SAVE_MENU_STATE,
  payload: data,
});
export const setFieldsJSON = (data: any): CommonAction => ({
  type: SET_FIELDS_JSON,
  payload: data,
});
export const setFieldsState = (data: any): CommonAction => ({
  type: SET_FIELDS_STATE,
  payload: data,
});
export const setStepperState = (data: any): CommonAction => ({
  type: SET_STEPPER_STATE,
  payload: data,
});
export const toggleSnackbar = (data: any): CommonAction => ({
  type: TOGGLE_SNACKBAR,
  payload: data,
});
export const toggleSessionPrompt = (data: boolean): CommonAction => ({
  type: TOGGLE_SESSION_PROMPT,
  payload: data,
});
export const commonAction = (data: any): CommonAction => ({
  type: COMMON_ACTION,
  payload: data,
});
export const commonActionSuccess = (data: any): CommonAction => ({
  type: COMMON_ACTION_SUCCESS,
  payload: data,
});
export const commonActionFailed = (data: any): CommonAction => ({
  type: COMMON_ACTION_FAILED,
  payload: data,
});

export const commonUserLoginSuccess = (data: any): CommonAction => ({
  type: SAVE_LOGGED_IN_DATA,
  payload: data,
});

export const setCachedMediaList = (data: any): CommonAction => ({
  type: CACHE_MEDIA_DATA,
  payload: data,
});
export const saveSocket = (data: any): CommonAction => ({
  type: SAVE_SOCKET,
  payload: data,
});
export const currentSelectedPerson = (data: any): CommonAction => ({
  type: CURRENT_SELECTED_PERSON,
  payload: data,
});
export const saveContacts = (data: any): CommonAction => ({
  type: SAVE_CONTACTS,
  payload: data,
});
