import React,{useState,useEffect,useCallback}from'react';import useApi from'../hooks/useApi';
var fmt=function(a){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2}).format(a)};
var IC_I=String.fromCodePoint(0x1F4B0),IC_E=String.fromCodePoint(0x1F4B8),IC_U=String.fromCodePoint(0x1F4C8),IC_D=String.fromCodePoint(0x1F4C9),IC_C=String.fromCodePoint(0x1F4CA);
export default function Dashboard({summary}){
  var{get}=useApi();var[bm,sBm]=useState({});var[pm,sPm]=useState({});
  var fb=useCallback(async function(){var now=new Date(),m=now.getMonth()+1,y=now.getFullYear();
    try{var bd=await get('/budgets/vs-actual?period=monthly&month='+m+'&year='+y);if(bd&&bd.budgets){var map={};bd.budgets.forEach(function(b){if(b.type==='expense'&&b.amount>0){var k=(b.category||'').toLowerCase();if(!map[k])map[k]={planned:0};map[k].planned+=b.amount}});sBm(map)}}catch(e){}
    try{var plans=await get('/plans');var pmap={};if(plans&&plans.length){plans.forEach(function(p){if(p.status==='cancelled'||p.status==='completed')return;var pd=new Date(p.date);if(pd.getMonth()+1===m&&pd.getFullYear()===y){var k=(p.category||'').toLowerCase();pmap[k]=(pmap[k]||0)+(p.estimatedBudget||0)}})}sPm(pmap)}catch(e){}
  },[get]);
  useEffect(function(){fb()},[fb]);
  if(!summary)return null;
  var ti=summary.totalIncome,te=summary.totalExpenses,bal=summary.balance,ebc=summary.expenseByCategory,ibc=summary.incomeByCategory,ec=summary.expenseCount,ic=summary.incomeCount;
  var twp=0;Object.entries(ebc).forEach(function(e){twp+=e[1]+(pm[(e[0]||'').toLowerCase()]||0)});
  Object.keys(pm).forEach(function(k){if(!Object.keys(ebc).some(function(c){return c.toLowerCase()===k}))twp+=pm[k]});
  var gbi=function(cat,amt){var k=(cat||'').toLowerCase();var b=bm[k];var pa=pm[k]||0;var tu=amt+pa;
    if(!b||b.planned<=0)return{cls:'',pct:'',pa:pa,tip:''};
    var pu=Math.round((tu/b.planned)*100);var cls=pu>100?'budget-status-red':pu>=80?'budget-status-orange':'budget-status-green';
    var tip='Spent: '+fmt(amt);if(pa>0)tip+=' | Planned: '+fmt(pa);tip+=' | Budget: '+fmt(b.planned);
    return{cls:cls,pct:pu+'% used',pa:pa,tip:tip}};
  var eb=Object.entries(ebc).sort(function(a,b){return(b[1]+(pm[(b[0]||'').toLowerCase()]||0))-(a[1]+(pm[(a[0]||'').toLowerCase()]||0))}).map(function(e){
    var cat=e[0],amt=e[1],k=cat.toLowerCase(),pa=pm[k]||0,comb=amt+pa;
    var bpct=twp>0?(comb/twp)*100:0,spct=twp>0?(amt/twp)*100:0;var bi=gbi(cat,amt);
    return(<div key={cat} className={'bar-row '+bi.cls} title={bi.tip}><span className="bar-label">{cat}</span>
      <div className="bar-track bar-track-stacked"><div className="bar-fill bar-fill-spent" style={{width:spct+'%'}}></div>{pa>0&&<div className="bar-fill bar-fill-planned" style={{width:(bpct-spct)+'%'}}></div>}</div>
      <span className="bar-value" title={bi.tip}>{fmt(comb)}</span>
      {bi.pct&&<span className={'budget-indicator '+bi.cls} title={bi.tip}>{bi.pct}</span>}</div>)});
  var ib=Object.entries(ibc).sort(function(a,b){return b[1]-a[1]}).map(function(e){var cat=e[0],amt=e[1],pct=ti>0?(amt/ti)*100:0;
    return<div key={cat} className="bar-row"><span className="bar-label">{cat}</span><div className="bar-track"><div className="bar-fill bar-income" style={{width:pct+'%'}}></div></div><span className="bar-value">{fmt(amt)}</span></div>});
  return(<div className="dashboard"><div className="summary-cards">
    <div className="summary-card card-income"><div className="card-icon">{IC_I}</div><div className="card-info"><span className="card-label">Total Income</span><span className="card-value text-green">{fmt(ti)}</span><span className="card-count">{ic} entries</span></div></div>
    <div className="summary-card card-expense"><div className="card-icon">{IC_E}</div><div className="card-info"><span className="card-label">Total Expenses</span><span className="card-value text-red">{fmt(te)}</span><span className="card-count">{ec} entries</span></div></div>
    <div className={'summary-card '+(bal>=0?'card-positive':'card-negative')}><div className="card-icon">{bal>=0?IC_U:IC_D}</div><div className="card-info"><span className="card-label">Balance</span><span className={'card-value '+(bal>=0?'text-green':'text-red')}>{fmt(bal)}</span><span className="card-count">{bal>=0?'Surplus':'Deficit'}</span></div></div>
  </div><div className="breakdown-section-split">
    {Object.keys(ebc).length>0&&<div className="breakdown-card breakdown-expense-wide"><h3>{IC_C} Expense Breakdown</h3><div className="breakdown-bars">{eb}</div></div>}
    {Object.keys(ibc).length>0&&<div className="breakdown-card breakdown-income-narrow"><h3>{IC_C} Income Breakdown</h3><div className="breakdown-bars">{ib}</div></div>}
  </div></div>)}
