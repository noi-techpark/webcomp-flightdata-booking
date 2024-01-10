/* 
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later 
*/
import DatePicker from 'vue2-datepicker';
import ar from 'date-format-parse/lib/locale/ar';

const lang = {
  formatLocale: ar,
  yearFormat: 'YYYY',
  monthFormat: 'MMM',
  monthBeforeYear: true,
};

DatePicker.locale('ar', lang);

export default lang;
