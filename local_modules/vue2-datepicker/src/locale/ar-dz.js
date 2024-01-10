/* 
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later 
*/
import DatePicker from 'vue2-datepicker';
import arDZ from 'date-format-parse/lib/locale/ar-dz';

const lang = {
  formatLocale: arDZ,
  yearFormat: 'YYYY',
  monthFormat: 'MMM',
  monthBeforeYear: true,
};

DatePicker.locale('ar-dz', lang);

export default lang;
