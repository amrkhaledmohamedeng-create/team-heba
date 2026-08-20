const SHEETS = {
  companies: 'Companies',
  areas: 'Areas',
  employees: 'Employees',
  activities: 'Activities'
};

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const defs = {
    Companies: ['ID','اسم الشركة','النشاط','المدير','الهاتف','الحي','المنطقة','الحالة','ملاحظات','آخر متابعة','الموظف المسؤول'],
    Areas: ['ID','الحي','المنطقة'],
    Employees: ['ID','اسم الموظف','الدور','الهاتف','اسم المستخدم','الحالة'],
    Activities: ['ID','CompanyID','نوع النشاط','التاريخ والوقت','الموظف','ملاحظات'],
    Users: ['ID','الاسم','اسم المستخدم','الدور','الهاتف','الحالة','تاريخ الإنشاء']
  };

  Object.keys(defs).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1,1,1,defs[name].length).setValues([defs[name]]);
      sh.setFrozenRows(1);
    }
  });

  return 'تم تجهيز الشيتات';
}

function doGet(e) {
  const action = (e.parameter.action || 'all').toLowerCase();
  setupSheets();

  if (action === 'all') {
    return json_({companies: readSheet_(SHEETS.companies), areas: readSheet_(SHEETS.areas), employees: readSheet_(SHEETS.employees)});
  }
  if (action === 'companies') return json_(readSheet_(SHEETS.companies));
  if (action === 'areas') return json_(readSheet_(SHEETS.areas));
  if (action === 'employees') return json_(readSheet_(SHEETS.employees));
  if (action === 'health') return json_({ok:true, message:'API يعمل'});
  return json_({ok:false, error:'Unknown action'});
}

function doPost(e) {
  try {
    setupSheets();
    const p = e.parameter || {};
    const action = p.action || '';

    if (action === 'saveCompany') {
      upsert_(SHEETS.companies, [
        p.id || Date.now().toString(), p.name || '', p.activity || '', p.manager || '',
        p.phone || '', p.district || '', p.area || '', p.status || 'لم يتم التواصل',
        p.notes || '', p.lastFollowup || new Date(), p.employee || ''
      ]);
      return json_({ok:true});
    }

    if (action === 'saveArea') {
      upsert_(SHEETS.areas, [p.id || Date.now().toString(), p.district || '', p.area || '']);
      return json_({ok:true});
    }

    if (action === 'saveEmployee') {
      upsert_(SHEETS.employees, [
        p.id || Date.now().toString(), p.name || '', p.role || 'موظف',
        p.phone || '', p.username || '', p.status || 'نشط'
      ]);
      return json_({ok:true});
    }

    if (action === 'signup') {
      const user = String(p.username || '').trim();
      if (!user || !p.name) return json_({ok:false,error:'بيانات ناقصة'});
      const existing = readSheet_(SHEETS.users).some(x => String(x['اسم المستخدم']).toLowerCase() === user.toLowerCase());
      if (existing) return json_({ok:false,error:'اسم المستخدم مستخدم بالفعل'});
      upsert_(SHEETS.users, [
        p.id || Date.now().toString(), p.name || '', user, p.role || 'موظف',
        p.phone || '', 'نشط', new Date()
      ]);
      return json_({ok:true});
    }

    if (action === 'saveActivity') {
      const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.activities);
      sh.appendRow([
        p.id || Date.now().toString(), p.companyId || '', p.type || '',
        new Date(), p.employee || '', p.notes || ''
      ]);
      return json_({ok:true});
    }

    if (action === 'deleteCompany') {
      deleteById_(SHEETS.companies, p.id);
      return json_({ok:true});
    }

    if (action === 'deleteArea') {
      deleteById_(SHEETS.areas, p.id);
      return json_({ok:true});
    }

    if (action === 'deleteEmployee') {
      deleteById_(SHEETS.employees, p.id);
      return json_({ok:true});
    }

    return json_({ok:false, error:'Unknown action'});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function readSheet_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.filter(r => r.some(v => v !== '')).map(r => {
    const o = {};
    headers.forEach((h,i) => o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]);
    return o;
  });
}

function upsert_(sheetName, row) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const id = String(row[0]);
  const data = sh.getDataRange().getValues();

  for (let r=1; r<data.length; r++) {
    if (String(data[r][0]) === id) {
      sh.getRange(r+1,1,1,row.length).setValues([row]);
      return;
    }
  }
  sh.appendRow(row);
}

function deleteById_(sheetName, id) {
  if (!id) return;
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sh.getDataRange().getValues();
  for (let r=data.length-1; r>=1; r--) {
    if (String(data[r][0]) === String(id)) {
      sh.deleteRow(r+1);
      return;
    }
  }
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(callback, data) {
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
