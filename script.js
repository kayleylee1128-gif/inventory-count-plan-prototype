const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const templates={
shortage:{title:"满足以下全部条件",help:"针对拣货作业中出现账实风险的 SKU + 货位发起盘点。",rows:[["统计事件","等于","拣货缺货"],["发生时间","过去","7 天"],["缺货次数","大于等于","1 次"]],preview:"统计过去 7 天内产生拣货缺货且缺货次数 ≥ 1 次的 SKU + 货位"},
abc:{title:"满足以下全部条件",help:"按商品价值或动销频率分级，提高高价值、高频商品的盘点频次。",rows:[["ABC 分类","等于","A 类"],["出库数量","大于等于","100 件"],["统计时间","过去","30 天"]],preview:"筛选 ABC 分类为 A 类，且过去 30 天出库数量 ≥ 100 件的 SKU + 货位"},
sample:{title:"从符合条件的数据池随机抽取",help:"从已完成盘点结果中随机复核，评估盘点作业质量；盘平、盘盈、盘亏可多选。",rows:[["盘点完成时间","过去","30 天"],["盘点结果","包含","盘平、盘盈、盘亏"],["随机抽取数量","等于","100 个 SKU"]],preview:"从过去 30 天已完成盘点且结果为盘平、盘盈或盘亏的数据中，随机抽取 100 个 SKU 对应的货位"},
periodic:{title:"满足以下盘点范围",help:"按仓库物理范围定期覆盖盘点；范围类型支持通道和指定货位。",rows:[["范围类型","等于","仓库通道"],["指定通道","包含","A01、A02"],["货位状态","等于","启用"]],preview:"对 A01、A02 通道内全部启用货位进行周期盘点，并生成货位下的 SKU 盘点明细"},
variance:{title:"满足以下任一条件",help:"对历史盘点差异较高或连续异常的数据进行复盘。",rows:[["盘点差异率","大于等于","2%"],["连续差异次数","大于等于","2 次"],["统计时间","过去","30 天"]],preview:"筛选过去 30 天盘点差异率 ≥ 2%，或连续发生 2 次盘点差异的 SKU + 货位"}
};
let currentType="shortage",runningName="";
function renderConditions(){
 const t=templates[currentType];$("#conditionTitle").textContent=t.title;
 $("#strategyHelp").textContent=t.help;
 $("#conditions").innerHTML=t.rows.map(r=>`<div class="condition-row"><button class="c-select select-control">${r[0]}<span>⌄</span></button><button class="c-select select-control">${r[1]}<span>⌄</span></button><input class="input" value="${r[2]}"><button class="c-icon-button remove">×</button></div>`).join("");
 updatePreview();
}
function updatePreview(){const t=templates[currentType];const exclude=$("#excludeRecent").checked?`，并剔除过去 ${$("#excludeDays").value||"X"} 天内已完成盘点的数据`:"";$("#preview").textContent=`${t.preview}${exclude}；按每任务 ${$("#limit").value||"X"} 条明细自动拆分。`}
function openDrawer(name=""){ $("#drawerTitle").textContent=name?"编辑盘点计划":"新建盘点计划";$("#planName").value=name;$("#drawer").classList.add("open");$("#drawer").setAttribute("aria-hidden","false");$("#mask").hidden=false;renderConditions()}
function closeAll(){$("#drawer").classList.remove("open");$("#drawer").setAttribute("aria-hidden","true");$("#confirm").hidden=true;$("#mask").hidden=true}
function toast(text){$("#toast").textContent=`✓ ${text}`;$("#toast").hidden=false;setTimeout(()=>$("#toast").hidden=true,2200)}
$("#createBtn").onclick=()=>openDrawer();$("#closeBtn").onclick=closeAll;$("#cancelBtn").onclick=closeAll;$("#mask").onclick=closeAll;
$$(".strategy").forEach(b=>b.onclick=()=>{currentType=b.dataset.type;$$(".strategy").forEach(x=>x.classList.toggle("selected",x===b));renderConditions()});
$("#excludeRecent").onchange=updatePreview;$("#excludeDays").oninput=updatePreview;$("#limit").oninput=updatePreview;
$("#saveBtn").onclick=()=>{if(!$("#planName").value.trim()){toast("请填写计划名称");return}closeAll();toast("盘点计划已保存并启用")};
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.toggle("active",x===b));$("#planView").hidden=b.dataset.view!=="plan";$("#recordView").hidden=b.dataset.view!=="record"});
$$(".edit").forEach(b=>b.onclick=()=>openDrawer(b.closest("tr").dataset.name));
$$(".run").forEach(b=>b.onclick=()=>{runningName=b.closest("tr").dataset.name;$("#confirmText").textContent=`系统将按“${runningName}”当前规则计算可盘数据并生成任务。`;$("#confirm").hidden=false;$("#mask").hidden=false});
$("#cancelRun").onclick=closeAll;$("#confirmRun").onclick=()=>{closeAll();toast(`${runningName} 已提交执行，请在生成记录查看结果`)};
$("#queryBtn").onclick=()=>{const k=$("#keyword").value.trim();let n=0;$$(".c-table #rows tr").forEach(r=>{r.hidden=k&&!r.dataset.name.includes(k);if(!r.hidden)n++});$("#count").textContent=n};
$("#resetBtn").onclick=()=>{$("#keyword").value="";$("#queryBtn").click()};
renderConditions();
