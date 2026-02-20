/**
 * 北海道旅行分帳 — Google Apps Script API
 *
 * 使用方式：
 * 1. 開啟你的 Google Sheet → 擴充功能 → Apps Script
 * 2. 把這段程式碼貼到 Code.gs
 * 3. 部署 → 新增部署 → 網頁應用程式
 *    - 執行身分：我
 *    - 存取權：所有人
 * 4. 複製部署 URL 貼到前端 splitbill.js 的 GAS_URL
 *
 * Google Sheet 需要兩個工作表：
 * Sheet 1: "Expenses" — 欄位：id, day, description, amount, paidBy, splitType, splitAmong, customAmounts, createdAt, deleted
 * Sheet 2: "Members"  — 欄位：id, name, order
 */

// ============================================================
// 成員列表（預設值，也可從 Members sheet 讀取）
// ============================================================
var DEFAULT_MEMBERS = [
  { id: 'amy', name: 'Amy', order: 1 },
  { id: 'luna', name: 'Luna', order: 2 },
  { id: 'fish', name: 'Fish', order: 3 },
  { id: 'tony', name: 'Tony', order: 4 },
  { id: 'parker', name: 'Parker', order: 5 },
  { id: 'awei', name: '阿維', order: 6 },
  { id: 'wei', name: 'Wei', order: 7 },
  { id: 'baoan', name: '保安', order: 8 },
  { id: 'chen', name: '陳', order: 9 },
  { id: 'liaojinwei', name: '廖晉緯', order: 10 },
  { id: 'wangyixiang', name: '王奕翔', order: 11 },
];

// ============================================================
// HTTP handlers
// ============================================================
function doGet(e) {
  var action = (e.parameter && e.parameter.action) || 'expenses';
  var result;

  try {
    switch (action) {
      case 'expenses':
        var day = e.parameter.day ? Number(e.parameter.day) : null;
        result = getExpenses(day);
        break;
      case 'members':
        result = getMembers();
        break;
      case 'settlement':
        result = getSettlement();
        break;
      case 'settlement_text':
        return ContentService.createTextOutput(getSettlementText())
          .setMimeType(ContentService.MimeType.TEXT);
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var action = body.action;
  var result;

  try {
    switch (action) {
      case 'add_expense':
        result = addExpense(body.data);
        break;
      case 'update_expense':
        result = updateExpense(body.id, body.data);
        break;
      case 'delete_expense':
        result = deleteExpense(body.id);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Expenses CRUD
// ============================================================
function getExpensesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName('Expenses');
}

function getExpenses(day) {
  var sheet = getExpensesSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  var headers = data[0];
  var expenses = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }

    if (String(row.deleted) === 'TRUE' || row.deleted === true) continue;

    var expense = {
      id: String(row.id),
      day: Number(row.day),
      description: String(row.description || ''),
      amount: Number(row.amount),
      paidBy: String(row.paidBy),
      splitType: String(row.splitType),
      splitAmong: safeParseJSON(row.splitAmong, []),
      customAmounts: safeParseJSON(row.customAmounts, {}),
      createdAt: String(row.createdAt),
    };

    if (day !== null && expense.day !== day) continue;
    expenses.push(expense);
  }

  expenses.sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return { success: true, data: expenses };
}

function addExpense(data) {
  if (!data.day || !data.amount || !data.paidBy || !data.splitType) {
    return { success: false, error: 'Missing required fields' };
  }

  var sheet = getExpensesSheet();
  var id = 'exp_' + new Date().getTime() + '_' + randomStr(6);
  var createdAt = new Date().toISOString();

  sheet.appendRow([
    id,
    data.day,
    data.description || '',
    data.amount,
    data.paidBy,
    data.splitType,
    JSON.stringify(data.splitAmong || []),
    data.customAmounts ? JSON.stringify(data.customAmounts) : '',
    createdAt,
    false,
  ]);

  return {
    success: true,
    data: {
      id: id,
      day: data.day,
      description: data.description || '',
      amount: data.amount,
      paidBy: data.paidBy,
      splitType: data.splitType,
      splitAmong: data.splitAmong || [],
      customAmounts: data.customAmounts || {},
      createdAt: createdAt,
    },
  };
}

function updateExpense(id, data) {
  var sheet = getExpensesSheet();
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idCol = headers.indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(id)) {
      var rowNum = i + 1;
      if (data.day !== undefined) sheet.getRange(rowNum, headers.indexOf('day') + 1).setValue(data.day);
      if (data.description !== undefined) sheet.getRange(rowNum, headers.indexOf('description') + 1).setValue(data.description);
      if (data.amount !== undefined) sheet.getRange(rowNum, headers.indexOf('amount') + 1).setValue(data.amount);
      if (data.paidBy !== undefined) sheet.getRange(rowNum, headers.indexOf('paidBy') + 1).setValue(data.paidBy);
      if (data.splitType !== undefined) sheet.getRange(rowNum, headers.indexOf('splitType') + 1).setValue(data.splitType);
      if (data.splitAmong !== undefined) sheet.getRange(rowNum, headers.indexOf('splitAmong') + 1).setValue(JSON.stringify(data.splitAmong));
      if (data.customAmounts !== undefined) sheet.getRange(rowNum, headers.indexOf('customAmounts') + 1).setValue(JSON.stringify(data.customAmounts));
      return { success: true };
    }
  }
  return { success: false, error: 'Expense not found' };
}

function deleteExpense(id) {
  var sheet = getExpensesSheet();
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idCol = headers.indexOf('id');
  var deletedCol = headers.indexOf('deleted');

  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(id)) {
      sheet.getRange(i + 1, deletedCol + 1).setValue(true);
      return { success: true };
    }
  }
  return { success: false, error: 'Expense not found' };
}

// ============================================================
// Members
// ============================================================
function getMembers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Members');

  if (!sheet) {
    return { success: true, data: DEFAULT_MEMBERS };
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: true, data: DEFAULT_MEMBERS };
  }

  var headers = data[0];
  var members = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    members.push({
      id: String(row.id),
      name: String(row.name),
      order: Number(row.order),
    });
  }

  members.sort(function(a, b) { return a.order - b.order; });
  return { success: true, data: members };
}

// ============================================================
// Settlement
// ============================================================
function getSettlement() {
  var expensesResult = getExpenses(null);
  var membersResult = getMembers();
  var expenses = expensesResult.data;
  var members = membersResult.data;

  var balances = calculateNetBalances(expenses, members);
  var transfers = simplifyDebts(balances);

  return { success: true, data: { balances: balances, transfers: transfers } };
}

function getSettlementText() {
  var result = getSettlement();
  var membersResult = getMembers();
  return generateSummaryText(result.data.balances, result.data.transfers, membersResult.data);
}

function calculateNetBalances(expenses, members) {
  var balances = {};
  members.forEach(function(m) { balances[m.id] = 0; });

  expenses.forEach(function(exp) {
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;

    if (exp.splitType === 'custom' && exp.customAmounts) {
      var keys = Object.keys(exp.customAmounts);
      for (var i = 0; i < keys.length; i++) {
        balances[keys[i]] = (balances[keys[i]] || 0) - Number(exp.customAmounts[keys[i]]);
      }
    } else {
      var participants = exp.splitAmong.length > 0 ? exp.splitAmong : members.map(function(m) { return m.id; });
      var share = Math.round(exp.amount / participants.length);
      participants.forEach(function(memberId) {
        balances[memberId] = (balances[memberId] || 0) - share;
      });
    }
  });

  return balances;
}

function simplifyDebts(balances) {
  var debtors = [];
  var creditors = [];

  var ids = Object.keys(balances);
  for (var k = 0; k < ids.length; k++) {
    var id = ids[k];
    var balance = balances[id];
    if (balance < -1) {
      debtors.push({ id: id, amount: -balance });
    } else if (balance > 1) {
      creditors.push({ id: id, amount: balance });
    }
  }

  debtors.sort(function(a, b) { return b.amount - a.amount; });
  creditors.sort(function(a, b) { return b.amount - a.amount; });

  var transfers = [];
  var i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    var transfer = Math.min(debtors[i].amount, creditors[j].amount);
    if (transfer > 0) {
      transfers.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: Math.round(transfer),
      });
    }
    debtors[i].amount -= transfer;
    creditors[j].amount -= transfer;
    if (debtors[i].amount < 1) i++;
    if (creditors[j].amount < 1) j++;
  }

  return transfers;
}

// ============================================================
// Helpers
// ============================================================
function formatJPY(amount) {
  return '¥' + Math.round(amount).toLocaleString('ja-JP');
}

function generateSummaryText(balances, transfers, members) {
  var memberMap = {};
  members.forEach(function(m) { memberMap[m.id] = m.name; });

  var lines = ['📊 北海道旅行分帳結算', ''];

  lines.push('【餘額總覽】');
  var entries = Object.keys(balances).map(function(id) { return [id, balances[id]]; });
  entries.sort(function(a, b) { return b[1] - a[1]; });

  entries.forEach(function(entry) {
    var id = entry[0], balance = entry[1];
    var name = memberMap[id] || id;
    if (balance > 1) {
      lines.push('  ' + name + ': +' + formatJPY(balance) + '（可收回）');
    } else if (balance < -1) {
      lines.push('  ' + name + ': -' + formatJPY(-balance) + '（需支付）');
    } else {
      lines.push('  ' + name + ': 已結清 ✓');
    }
  });

  lines.push('');
  lines.push('【最少轉帳方案】');
  if (transfers.length === 0) {
    lines.push('  所有人已結清！');
  } else {
    transfers.forEach(function(t, i) {
      lines.push('  ' + (i + 1) + '. ' + (memberMap[t.from] || t.from) + ' → ' + (memberMap[t.to] || t.to) + ': ' + formatJPY(t.amount));
    });
  }

  return lines.join('\n');
}

function safeParseJSON(str, fallback) {
  try {
    if (!str || str === '') return fallback;
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function randomStr(len) {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================
// 初始化：自動建立 Sheet 標題列
// ============================================================
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var expenses = ss.getSheetByName('Expenses');
  if (!expenses) {
    expenses = ss.insertSheet('Expenses');
    expenses.appendRow(['id', 'day', 'description', 'amount', 'paidBy', 'splitType', 'splitAmong', 'customAmounts', 'createdAt', 'deleted']);
  }

  var members = ss.getSheetByName('Members');
  if (!members) {
    members = ss.insertSheet('Members');
    members.appendRow(['id', 'name', 'order']);
    DEFAULT_MEMBERS.forEach(function(m) {
      members.appendRow([m.id, m.name, m.order]);
    });
  }

  Logger.log('Sheets initialized!');
}
