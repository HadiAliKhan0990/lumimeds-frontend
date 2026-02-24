'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import patient from '@/store/slices/patientSlice';
import admins from '@/store/slices/adminsSlice';
import patients from '@/store/slices/patientsSlice';
// import videoCallReducer from '@/store/slices/videoCallSlice';
// import videoCallsReducer from '@/store/slices/videoCallsSlice';
import patientProfile from '@/store/slices/patientProfileSlice';
import providerReducer from '@/store/slices/providerSlice';
import subscriptionReducer from '@/store/slices/subscriptionSlice';
import subscriptionsReducer from '@/store/slices/subscriptionsSlice';
import invoiceReducer from '@/store/slices/invoiceSlice';
import invoicesReducer from '@/store/slices/invoicesSlice';
import medicationReducer from '@/store/slices/medicationSlice';
import medicationsReducer from '@/store/slices/medicationsSlice';
import medicationsProductsReducer from '@/store/slices/medicationsProductsSlice';
import patientNoteReducer from '@/store/slices/patientNoteSlice';
import patientNotesReducer from '@/store/slices/patientNotesSlice';
import productType from '@/store/slices/productTypeSlice';
import productTypes from '@/store/slices/productTypesSlice';
import pharmacyReducer from '@/store/slices/pharmacySlice';
import pharmaciesReducer from '@/store/slices/pharmaciesSlice';
import order from '@/store/slices/orderSlice';
import orderPayment from '@/store/slices/orderPaymentSlice';
import orders from '@/store/slices/ordersSlice';
import approvedRx from '@/store/slices/approvedRxSlice';
import surveyReducer from '@/store/slices/surveySlice';
import surveyResponsePopup from '@/store/slices/surveyResponsePopupSlice';
import surveysReducer from '@/store/slices/surveysSlice';
import surveyTypeReducer from '@/store/slices/surveyTypeSlice';
import surveyTypesReducer from '@/store/slices/surveyTypesSlice';
import surveyResponseReducer from '@/store/slices/surveyResponseSlice';
import surveyResponsesReducer from '@/store/slices/surveyResponsesSlice';
import surveyQuestionReducer from '@/store/slices/surveyQuestionSlice';
import surveyQuestions from '@/store/slices/surveyQuestionsSlice';
import selectedOrder from '@/store/slices/selectedOrderSlice';
import dashboard from '@/store/slices/dashboardSlice';
import patientSurveys from '@/store/slices/patientSurveysSlice';
import patientChat from '@/store/slices/patientChatSlice';
import blaseMessaging from '@/store/slices/blaseMessagingSlice';
// import saleReducer from '@/store/slices/saleSlice';
// import salesReducer from '@/store/slices/salesSlice';
import chat from '@/store/slices/chatSlice';
import patientOrders from '@/store/slices/patientOrdersSlice';
import patientAccount from '@/store/slices/patientAccountSlice';
import checkout from '@/store/slices/checkoutSlice';
import formData from '@/store/slices/formDataSlice';
import patientPopupReducer from '@/store/slices/popupSlice';
import modal from '@/store/slices/modalSlice';
import calendlyReducer from '@/store/slices/calendlySlice';
import appointmentsRealTimeReducer from '@/store/slices/appointmentsRealTimeSlice';
import encountersRealTimeReducer from '@/store/slices/encountersRealTimeSlice';
import user from '@/store/slices/userSlice';
import patientActiveSubscription from '@/store/slices/patientAtiveSubscriptionSlice';
import answers from '@/store/slices/answersSlice';
import updateOrder from '@/store/slices/updateOrderSlice';
import general from '@/store/slices/generalSlice';
import paymentMethods from '@/store/slices/paymentMethodsSlice';
import adminPharmacies from '@/store/slices/adminPharmaciesSlice';
import doctors from '@/store/slices/doctorsSlice';
import medicineTypes from '@/store/slices/medicineTypesSlice';
import patientSubscription from '@/store/slices/patientSubscriptionSlice';
import productCategories from '@/store/slices/productCategoriesSlice';
import medicationsProductsData from '@/store/slices/medicationsProductsDataSlice';
import sort from '@/store/slices/sortSlice';
import { checkoutApi } from '@/store/slices/checkoutApiSlice';
import { usersApi } from '@/store/slices/usersApiSlice';
import { refillsApi } from '@/store/slices/refillsApiSlice';
import { hubspotApi } from '@/store/slices/hubspotApiSlice';
import { patientsApi } from '@/store/slices/patientsApiSlice';
import { patientApi } from '@/store/slices/patientApiSlice';
import { ordersApi } from '@/store/slices/ordersApiSlice';
import { sortOrderHistorySlice } from '@/store/slices/sortOrderHistorySlice';
import { selectedRowsSlice } from '@/store/slices/selectedRowsSlice';
import { medicationsApi } from '@/store/slices/medicationsApiSlice';
import { productTypesApi } from '@/store/slices/productTypesApiSlice';
import { pharmaciesApi } from '@/store/slices/pharmaciesApiSlice';
import { userApi } from '@/store/slices/userApiSlice';
import { providersApi } from '@/store/slices/providersApiSlice';
import { surveysApi } from '@/store/slices/surveysApiSlice';
import { providerInviteApi } from '@/store/slices/providerInviteApi';
import { adminApi } from '@/store/slices/adminApiSlice';
import { chatApi } from '@/store/slices/chatApiSlice';
import { patientChatApi } from '@/store/slices/patientChatApiSlice';
import { subscriptionsApi } from '@/store/slices/subscriptionsApiSlice';
import { invoicesApi } from '@/store/slices/invoicesApiSlice';
import { dashboardApi } from '@/store/slices/dashboardApiSlice';
import { patientPaymentApiSlice } from '@/store/slices/patientPaymentApiSlice';
import { orderNotesApi } from '@/store/slices/orderNotesApiSlice';
import trustpilot from '@/store/slices/trustpilotSlice';
import { notificationsApi } from '@/store/slices/notificationsApiSlice';
import notifications from '@/store/slices/notificationsSlice';
import { calendlyApi } from '@/store/slices/calendlyApiSlice';
import { providerDashboardApi } from '@/store/slices/providerDashboardApiSlice';
import { agentsApi } from '@/store/slices/agentsApiSlice';
import agentReducer from '@/store/slices/agentSlice';
import agentsReducer from '@/store/slices/agentsSlice';
import licensedStatesReducer from '@/store/slices/licensedStatesSlice';
import { agentApi } from '@/store/slices/agentApiSlice';
import { attachmentsApi } from '@/store/slices/attachmentsApiSlice';
import { paymentApi } from '@/store/slices/paymentApiSlice';
import { telepathApi, telepathLambdaApi } from '@/store/slices/telepathApiSlice';
import { messageTemplatesApi } from '@/store/slices/messageTemplatesApiSlice';
import messageTemplates from '@/store/slices/messageTemplatesSlice';
import { activityLogsApi } from '@/store/slices/activityLogsApiSlice';
import activityLogReducer from '@/store/slices/activityLogSlice';
import singleOrder from '@/store/slices/singleOrderSlice';
import formBuilder from '@/store/slices/formBuilderSlice';
import { impersonationApi } from '@/store/slices/impersonationApiSlice';

// Persist configuration for user reducer only
const persistConfig = {
  key: 'user',
  storage,
};

const rootReducer = combineReducers({
  admins,
  agent: agentReducer,
  agents: agentsReducer,
  activityLog: activityLogReducer,
  answers,
  adminPharmacies,
  approvedRx,
  appointmentsRealTime: appointmentsRealTimeReducer,

  blaseMessaging,

  chat,
  checkout,
  calendly: calendlyReducer,

  dashboard,
  doctors,

  encountersRealTime: encountersRealTimeReducer,

  formBuilder,

  general,

  invoice: invoiceReducer,
  invoices: invoicesReducer,

  licensedStates: licensedStatesReducer,

  medication: medicationReducer,
  medications: medicationsReducer,
  medicationsProducts: medicationsProductsReducer,
  medicineTypes,
  medicationsProductsData,
  messageTemplates,
  modal,

  order,
  orders,
  orderPayment,
  // videoCall: videoCallReducer,
  // videoCalls: videoCallsReducer,
  paymentMethods,
  patient,
  patients,
  patientSubscription,
  patientSurveys,
  patientOrders,
  patientAccount,
  patientProfile,
  formData,
  provider: providerReducer,

  patientNote: patientNoteReducer,
  patientNotes: patientNotesReducer,
  productCategories,
  productType,
  productTypes,
  pharmacy: pharmacyReducer,
  pharmacies: pharmaciesReducer,
  patientChat,
  patientActiveSubscription,
  // sale: saleReducer,
  // sales: salesReducer,

  popup: patientPopupReducer,

  selectedOrder,
  singleOrder,
  sort,
  sortOrderHistory: sortOrderHistorySlice.reducer,
  selectedRows: selectedRowsSlice.reducer,
  subscription: subscriptionReducer,
  subscriptions: subscriptionsReducer,
  survey: surveyReducer,
  surveys: surveysReducer,
  surveyType: surveyTypeReducer,
  surveyTypes: surveyTypesReducer,
  surveyResponse: surveyResponseReducer,
  surveyResponses: surveyResponsesReducer,
  surveyQuestion: surveyQuestionReducer,
  surveyQuestions,
  surveyResponsePopup,

  trustpilot,
  user: persistReducer(persistConfig, user),
  updateOrder,
  notifications,

  [usersApi.reducerPath]: usersApi.reducer,
  [checkoutApi.reducerPath]: checkoutApi.reducer,
  [refillsApi.reducerPath]: refillsApi.reducer,
  [hubspotApi.reducerPath]: hubspotApi.reducer,
  [patientsApi.reducerPath]: patientsApi.reducer,
  [patientApi.reducerPath]: patientApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [medicationsApi.reducerPath]: medicationsApi.reducer,
  [productTypesApi.reducerPath]: productTypesApi.reducer,
  [pharmaciesApi.reducerPath]: pharmaciesApi.reducer,
  [providersApi.reducerPath]: providersApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [surveysApi.reducerPath]: surveysApi.reducer,
  [providerInviteApi.reducerPath]: providerInviteApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [patientChatApi.reducerPath]: patientChatApi.reducer,
  [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
  [patientPaymentApiSlice.reducerPath]: patientPaymentApiSlice.reducer,
  [invoicesApi.reducerPath]: invoicesApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [orderNotesApi.reducerPath]: orderNotesApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [calendlyApi.reducerPath]: calendlyApi.reducer,
  [providerDashboardApi.reducerPath]: providerDashboardApi.reducer,
  [agentApi.reducerPath]: agentApi.reducer,
  [agentsApi.reducerPath]: agentsApi.reducer,
  [attachmentsApi.reducerPath]: attachmentsApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [telepathApi.reducerPath]: telepathApi.reducer,
  [telepathLambdaApi.reducerPath]: telepathLambdaApi.reducer,
  [messageTemplatesApi.reducerPath]: messageTemplatesApi.reducer,
  [activityLogsApi.reducerPath]: activityLogsApi.reducer,
  [impersonationApi.reducerPath]: impersonationApi.reducer,
});

const resetState = () => {
  return rootReducer(undefined, { type: 'RESET' });
};

export const store = configureStore({
  reducer: (state, action) => {
    if (action.type === 'RESET') {
      state = resetState();
    }
    return rootReducer(state, action);
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([
      checkoutApi.middleware,
      patientsApi.middleware,
      refillsApi.middleware,
      hubspotApi.middleware,
      usersApi.middleware,
      patientApi.middleware,
      ordersApi.middleware,
      medicationsApi.middleware,
      productTypesApi.middleware,
      pharmaciesApi.middleware,
      providersApi.middleware,
      userApi.middleware,
      surveysApi.middleware,
      providerInviteApi.middleware,
      adminApi.middleware,
      chatApi.middleware,
      patientChatApi.middleware,
      subscriptionsApi.middleware,
      invoicesApi.middleware,
      dashboardApi.middleware,
      patientPaymentApiSlice.middleware,
      orderNotesApi.middleware,
      notificationsApi.middleware,
      calendlyApi.middleware,
      providerDashboardApi.middleware,
      agentApi.middleware,
      agentsApi.middleware,
      attachmentsApi.middleware,
      paymentApi.middleware,
      telepathApi.middleware,
      telepathLambdaApi.middleware,
      messageTemplatesApi.middleware,
      activityLogsApi.middleware,
      impersonationApi.middleware,
    ]),
});

setupListeners(store.dispatch);

// Create persistor for redux-persist
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;
