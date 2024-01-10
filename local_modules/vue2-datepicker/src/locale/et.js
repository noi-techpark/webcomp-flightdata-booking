/* 
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later 
*/
import DatePicker from 'vue2-datepicker';
import et from 'date-format-parse/lib/locale/et';

const lang = {
  formatLocale: et,
  yearFormat: 'YYYY',
  monthFormat: 'MMM',
  monthBeforeYear: true,
};

DatePicker.locale('et', lang);

export default lang;
