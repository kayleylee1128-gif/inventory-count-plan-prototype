const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const templates={
shortage:{title:"满足以下全部条件",help:"针对拣货作业中出现账实风险的 SKU + 货位发起盘点。",rows:[["统计事件","等于","拣货缺货"],["发生时间","过去","7 天"],["缺货次数","大于等于","1 次"]],preview:"统计过去 7 天内产生拣货缺货且缺货次数 ≥ 1 次的 SKU + 货位"},
abc:{title:"满足以下全部条件",help:"按销售状态与统计周期内的出库数量筛选动销商品。",preview:"筛选动销商品"},
sample:{title:"从符合条件的数据池随机抽取",help:"从已完成盘点结果中随机复核，评估盘点作业质量；盘平、盘盈、盘亏可多选。",rows:[["盘点完成时间","过去","30 天"],["盘点结果","包含","盘平、盘盈、盘亏"],["随机抽取数量","等于","100 个 SKU"]],preview:"从过去 30 天已完成盘点且结果为盘平、盘盈或盘亏的数据中，随机抽取 100 个 SKU 对应的货位"},
periodic:{title:"满足以下盘点范围",help:"按指定仓库通道与货位状态定期覆盖盘点。",preview:"对 A01、A02 通道内全部启用货位进行周期盘点，并生成货位下的 SKU 盘点明细"},
variance:{title:"满足以下任一条件",help:"对历史盘点差异较高或连续异常的数据进行复盘。",rows:[["盘点差异率","大于等于","2%"],["连续差异次数","大于等于","2 次"],["统计时间","过去","30 天"]],preview:"筛选过去 30 天盘点差异率 ≥ 2%，或连续发生 2 次盘点差异的 SKU + 货位"}
};
let currentType="shortage",runningName="";
let sampleResults=["盘平","盘盈","盘亏"];
let salesStatus="在售";
let channelResults=["A01","A02"];
let locationStatus="启用";
function renderConditions(){
 const t=templates[currentType];$("#conditionTitle").textContent=t.title;
 $("#strategyHelp").textContent=t.help;
 if(currentType==="shortage"){
  $("#conditions").innerHTML=`
   <div class="condition-row"><button class="c-select select-control">发生时间<span>⌄</span></button><button class="c-select select-control">过去<span>⌄</span></button><div class="number-unit"><input id="shortageDays" class="input" type="number" min="1" step="1" value="7"><span>天</span></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">缺货次数<span>⌄</span></button><button class="c-select select-control">大于等于<span>⌄</span></button><div class="number-unit"><input id="shortageCount" class="input" type="number" min="1" step="1" value="1"><span>次</span></div><button class="c-icon-button remove">×</button></div>`;
 }else if(currentType==="abc"){
  $("#conditions").innerHTML=`
   <div class="condition-row"><button class="c-select select-control">销售状态<span>⌄</span></button><button class="c-select select-control">等于<span>⌄</span></button><div id="salesStatusSelect" class="single-select"><button class="c-select single-select__trigger" type="button" aria-expanded="false"><span>${salesStatus}</span><span>⌄</span></button><div class="single-select__menu" hidden>${["在售","停售","清仓"].map(v=>`<button class="c-select-option ${v===salesStatus?"selected":""}" type="button" data-sales-status="${v}">${v}</button>`).join("")}</div></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">出库数量<span>⌄</span></button><button class="c-select select-control">大于等于<span>⌄</span></button><div class="number-unit"><input id="salesOutboundQty" class="input" type="number" min="1" step="1" value="100"><span>件</span></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">统计时间<span>⌄</span></button><button class="c-select select-control">过去<span>⌄</span></button><div class="number-unit"><input id="salesDays" class="input" type="number" min="1" step="1" value="30"><span>天</span></div><button class="c-icon-button remove">×</button></div>`;
 }else if(currentType==="sample"){
  $("#conditions").innerHTML=`
   <div class="condition-row"><button class="c-select select-control">盘点完成时间<span>⌄</span></button><button class="c-select select-control">过去<span>⌄</span></button><div class="number-unit"><input id="sampleDays" class="input" type="number" min="1" value="30"><span>天</span></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">盘点结果<span>⌄</span></button><button class="c-select select-control">包含<span>⌄</span></button><div id="sampleResultSelect" class="multi-select"><button class="c-select multi-select__trigger" type="button" aria-expanded="false"><span class="multi-select__tags"></span><span class="multi-select__arrow">⌄</span></button><div class="multi-select__menu" hidden>${["盘平","盘盈","盘亏"].map(v=>`<label><input type="checkbox" value="${v}" checked><span>${v}</span></label>`).join("")}</div></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">随机抽取数量<span>⌄</span></button><button class="c-select select-control">等于<span>⌄</span></button><div class="number-unit"><input id="sampleCount" class="input" type="number" min="1" step="1" value="100"><span>个 SKU</span></div><button class="c-icon-button remove">×</button></div>`;
  renderSampleTags();
 }else if(currentType==="periodic"){
  $("#conditions").innerHTML=`
   <div class="condition-row"><button class="c-select select-control">指定通道<span>⌄</span></button><button class="c-select select-control">包含<span>⌄</span></button><div id="channelSelect" class="multi-select"><button class="c-select multi-select__trigger" type="button" aria-expanded="false"><span class="multi-select__tags"></span><span class="multi-select__arrow">⌄</span></button><div class="multi-select__menu" hidden>${["A01","A02","A03","A04","A05"].map(v=>`<label><input type="checkbox" value="${v}" ${channelResults.includes(v)?"checked":""}><span>${v}</span></label>`).join("")}</div></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">货位状态<span>⌄</span></button><button class="c-select select-control">等于<span>⌄</span></button><div id="locationStatusSelect" class="single-select"><button class="c-select single-select__trigger" type="button" aria-expanded="false"><span>${locationStatus}</span><span>⌄</span></button><div class="single-select__menu" hidden>${["启用","停用","全部"].map(v=>`<button class="c-select-option ${v===locationStatus?"selected":""}" type="button" data-location-status="${v}">${v}</button>`).join("")}</div></div><button class="c-icon-button remove">×</button></div>`;
  renderChannelTags();
 }else if(currentType==="variance"){
  $("#conditions").innerHTML=`
   <div class="condition-row"><button class="c-select select-control">盘点差异率<span>⌄</span></button><button class="c-select select-control">大于等于<span>⌄</span></button><div class="number-unit"><input id="varianceRate" class="input" type="number" min="0.01" step="0.01" value="2"><span>%</span></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">连续差异次数<span>⌄</span></button><button class="c-select select-control">大于等于<span>⌄</span></button><div class="number-unit"><input id="varianceCount" class="input" type="number" min="1" step="1" value="2"><span>次</span></div><button class="c-icon-button remove">×</button></div>
   <div class="condition-row"><button class="c-select select-control">统计时间<span>⌄</span></button><button class="c-select select-control">过去<span>⌄</span></button><div class="number-unit"><input id="varianceDays" class="input" type="number" min="1" step="1" value="30"><span>天</span></div><button class="c-icon-button remove">×</button></div>`;
 }else{
  $("#conditions").innerHTML=t.rows.map(r=>`<div class="condition-row"><button class="c-select select-control">${r[0]}<span>⌄</span></button><button class="c-select select-control">${r[1]}<span>⌄</span></button><input class="input" value="${r[2]}"><button class="c-icon-button remove">×</button></div>`).join("");
 }
 updatePreview();
}
function renderSampleTags(){
 const holder=document.querySelector("#sampleResultSelect .multi-select__tags");if(!holder)return;
 holder.innerHTML=sampleResults.length?sampleResults.map(v=>`<span class="selection-tag">${v}<button class="c-tag-remove" type="button" data-remove-result="${v}" aria-label="移除${v}">×</button></span>`).join(""):'<span class="multi-select__placeholder">请选择盘点结果</span>';
}
function renderChannelTags(){
 const holder=document.querySelector("#channelSelect .multi-select__tags");if(!holder)return;
 holder.innerHTML=channelResults.length?channelResults.map(v=>`<span class="selection-tag">${v}<button class="c-tag-remove" type="button" data-remove-channel="${v}" aria-label="移除${v}">×</button></span>`).join(""):'<span class="multi-select__placeholder">请选择通道</span>';
}
function updatePreview(){
 const t=templates[currentType];const exclude=$("#excludeRecent").checked?`，并剔除过去 ${$("#excludeDays").value||"X"} 天内已完成盘点的数据`:"";
 const base=currentType==="shortage"?`统计过去 ${$("#shortageDays")?.value||"X"} 天内产生拣货缺货且缺货次数 ≥ ${$("#shortageCount")?.value||"X"} 次的 SKU + 货位`:currentType==="sample"?`从过去 ${$("#sampleDays")?.value||"X"} 天已完成盘点且结果为${sampleResults.length?sampleResults.join("、"):"未选择"}的数据中，随机抽取 ${$("#sampleCount")?.value||"X"} 个 SKU 对应的货位`:currentType==="abc"?`筛选销售状态为${salesStatus}，过去 ${$("#salesDays")?.value||"X"} 天出库数量 ≥ ${$("#salesOutboundQty")?.value||"X"} 件的 SKU + 货位`:currentType==="periodic"?`对 ${channelResults.length?channelResults.join("、"):"未选择"} 通道内货位状态为${locationStatus}的货位进行周期盘点，并生成货位下的 SKU 盘点明细`:currentType==="variance"?`筛选过去 ${$("#varianceDays")?.value||"X"} 天盘点差异率 ≥ ${$("#varianceRate")?.value||"X"}%，或连续发生 ${$("#varianceCount")?.value||"X"} 次盘点差异的 SKU + 货位`:t.preview;
 $("#preview").textContent=`${base}${exclude}；按每任务 ${$("#limit").value||"X"} 条明细自动拆分。`;
}
function openDrawer(name=""){ $("#drawerTitle").textContent=name?"编辑盘点计划":"新建盘点计划";$("#planName").value=name;$("#drawer").classList.add("open");$("#drawer").setAttribute("aria-hidden","false");$("#mask").hidden=false;renderConditions()}
function closeAll(){$("#drawer").classList.remove("open");$("#drawer").setAttribute("aria-hidden","true");$("#confirm").hidden=true;$("#mask").hidden=true}
function toast(text){$("#toast").textContent=`✓ ${text}`;$("#toast").hidden=false;setTimeout(()=>$("#toast").hidden=true,2200)}
$("#createBtn").onclick=()=>openDrawer();$("#closeBtn").onclick=closeAll;$("#cancelBtn").onclick=closeAll;$("#mask").onclick=closeAll;
$$(".strategy").forEach(b=>b.onclick=()=>{currentType=b.dataset.type;$$(".strategy").forEach(x=>x.classList.toggle("selected",x===b));renderConditions()});
$("#excludeRecent").onchange=updatePreview;$("#excludeDays").oninput=updatePreview;$("#limit").oninput=updatePreview;
$("#conditions").addEventListener("click",event=>{
 const trigger=event.target.closest(".multi-select__trigger");
 if(trigger){const menu=trigger.closest(".multi-select").querySelector(".multi-select__menu");menu.hidden=!menu.hidden;trigger.setAttribute("aria-expanded",String(!menu.hidden));return}
 const remove=event.target.closest("[data-remove-result]");
 if(remove){sampleResults=sampleResults.filter(v=>v!==remove.dataset.removeResult);const checkbox=document.querySelector(`.multi-select__menu input[value="${remove.dataset.removeResult}"]`);if(checkbox)checkbox.checked=false;renderSampleTags();updatePreview();}
 const removeChannel=event.target.closest("[data-remove-channel]");
 if(removeChannel){channelResults=channelResults.filter(v=>v!==removeChannel.dataset.removeChannel);const checkbox=document.querySelector(`#channelSelect input[value="${removeChannel.dataset.removeChannel}"]`);if(checkbox)checkbox.checked=false;renderChannelTags();updatePreview();}
 const salesTrigger=event.target.closest(".single-select__trigger");
 if(salesTrigger){const menu=salesTrigger.closest(".single-select").querySelector(".single-select__menu");menu.hidden=!menu.hidden;salesTrigger.setAttribute("aria-expanded",String(!menu.hidden));return}
 const salesOption=event.target.closest("[data-sales-status]");
 if(salesOption){salesStatus=salesOption.dataset.salesStatus;renderConditions();}
 const locationOption=event.target.closest("[data-location-status]");
 if(locationOption){locationStatus=locationOption.dataset.locationStatus;renderConditions();}
});
$("#conditions").addEventListener("change",event=>{
 if(event.target.matches("#sampleResultSelect input")){sampleResults=[...document.querySelectorAll("#sampleResultSelect input:checked")].map(x=>x.value);renderSampleTags();updatePreview();}
 if(event.target.matches("#channelSelect input")){channelResults=[...document.querySelectorAll("#channelSelect input:checked")].map(x=>x.value);renderChannelTags();updatePreview();}
});
$("#conditions").addEventListener("input",event=>{if(event.target.matches("#shortageDays,#shortageCount,#sampleDays,#sampleCount,#salesOutboundQty,#salesDays,#varianceRate,#varianceCount,#varianceDays")){event.target.classList.toggle("input-error",Number(event.target.value)<=0);updatePreview();}});
document.addEventListener("click",event=>{if(!event.target.closest(".multi-select")){$$(".multi-select__menu").forEach(menu=>menu.hidden=true);$$(".multi-select__trigger").forEach(trigger=>trigger.setAttribute("aria-expanded","false"))}if(!event.target.closest(".single-select")){$$(".single-select__menu").forEach(menu=>menu.hidden=true);$$(".single-select__trigger").forEach(trigger=>trigger.setAttribute("aria-expanded","false"))}});
$("#saveBtn").onclick=()=>{if(!$("#planName").value.trim()){toast("请填写计划名称");return}if(currentType==="shortage"&&["#shortageDays","#shortageCount"].some(selector=>Number($(selector)?.value)<=0)){toast("发生时间和缺货次数必须大于 0");return}if(currentType==="sample"&&(!sampleResults.length||Number($("#sampleCount")?.value)<1)){toast(!sampleResults.length?"请至少选择一种盘点结果":"随机抽取数量必须大于 0");return}if(currentType==="abc"&&(Number($("#salesOutboundQty")?.value)<1||Number($("#salesDays")?.value)<1)){toast("出库数量和统计时间必须大于 0");return}if(currentType==="periodic"&&!channelResults.length){toast("请至少选择一个仓库通道");return}if(currentType==="variance"&&["#varianceRate","#varianceCount","#varianceDays"].some(selector=>Number($(selector)?.value)<=0)){toast("历史差异条件值必须大于 0");return}closeAll();toast("盘点计划已保存并启用")};
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.toggle("active",x===b));$("#planView").hidden=b.dataset.view!=="plan";$("#recordView").hidden=b.dataset.view!=="record"});
$$(".edit").forEach(b=>b.onclick=()=>openDrawer(b.closest("tr").dataset.name));
$$(".run").forEach(b=>b.onclick=()=>{runningName=b.closest("tr").dataset.name;$("#confirmText").textContent=`系统将按“${runningName}”当前规则计算可盘数据并生成任务。`;$("#confirm").hidden=false;$("#mask").hidden=false});
$("#cancelRun").onclick=closeAll;$("#confirmRun").onclick=()=>{closeAll();toast(`${runningName} 已提交执行，请在生成记录查看结果`)};
$("#queryBtn").onclick=()=>{const k=$("#keyword").value.trim();let n=0;$$(".c-table #rows tr").forEach(r=>{r.hidden=k&&!r.dataset.name.includes(k);if(!r.hidden)n++});$("#count").textContent=n};
$("#resetBtn").onclick=()=>{$("#keyword").value="";$("#queryBtn").click()};
renderConditions();
