import { bool, shape, string } from 'prop-types';
import {
  BOOKING_PROCESS_NAME,
  PRODUCT_PROCESS_NAME,
  resolveLatestProcessName,
  getProcess,
} from '../../util/transaction';

import { getStateDataForBookingProcess } from './InboxPage.stateDataBooking.js';
import { getStateDataForProductProcess } from './InboxPage.stateDataProduct.js';

export const stateDataShape = shape({
  processName: string.isRequired,
  processState: string.isRequired,
  actionNeeded: bool,
  isFinal: bool,
  isSaleNotification: bool,
});

// Translated name of the state of the given transaction
export const getStateData = params => {
  const { transaction } = params;
  const processName = resolveLatestProcessName(transaction?.attributes?.processName);
  const process = getProcess(processName);

  const processInfo = () => {
    const { getState, states } = process;
    const processState = getState(transaction);
    return {
      processName,
      processState,
      states,
    };
  };

  if (processName === PRODUCT_PROCESS_NAME) {
    return getStateDataForProductProcess(params, processInfo());
  } else if (processName === BOOKING_PROCESS_NAME) {
    return getStateDataForBookingProcess(params, processInfo());
  } else {
    return {};
  }
};
