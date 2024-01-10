/* 
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later 
*/
/* istanbul ignore file */
export function rafThrottle(fn) {
  let isRunning = false;
  return function fnBinfRaf(...args) {
    if (isRunning) return;
    isRunning = true;
    requestAnimationFrame(() => {
      isRunning = false;
      fn.apply(this, args);
    });
  };
}
