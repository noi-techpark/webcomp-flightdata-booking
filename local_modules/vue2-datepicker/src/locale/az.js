/* 
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later 
*/
import DatePicker from 'vue2-datepicker';
import az from 'date-format-parse/lib/locale/az';

const lang = {
  formatLocale: az,
  yearFormat: 'YYYY',
  monthFormat: 'MMM',
  monthBeforeYear: true,
};

DatePicker.locale('az', lang);

export default lang;
