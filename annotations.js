const annotationData = [
  { id: 1, type: "页面", target: ".c-page-header", title: "盘点计划管理页", text: "模块目的：集中维护自动盘点计划并查看生成记录。\n适用角色：仓库主管、库存管理员。\n入口：库存管理 / 盘点计划；下游为盘点任务。" },
  { id: 2, type: "页面", target: ".overview", title: "计划执行概览", text: "仅展示启用计划数与今日生成任务数，帮助管理人员快速判断计划运行情况；不承载待办任务和去重统计。" },
  { id: 3, type: "交互", target: "#createBtn", title: "新建盘点计划", text: "触发方式：点击按钮打开右侧编辑抽屉。\n操作结果：保留列表上下文并进入计划配置。\n失败反馈：必填项缺失时阻断保存并定位字段。" },
  { id: 4, type: "规则", target: ".strategy-grid", title: "盘点策略选择", text: "策略互斥，只能选择一种。动销按销售状态、出库数量和统计周期筛选；抽盘用于从已完成盘点结果中随机复核。", openDrawer: true, sales: true },
  { id: 5, type: "字段", target: "#salesStatusSelect", title: "销售状态", text: "口径：商品主数据中的销售状态。\n必填：是；默认值：在售。\n交互：下拉单选，当前原型提供在售、停售、清仓。", openDrawer: true, sales: true },
  { id: 6, type: "字段", target: "#salesOutboundQty", title: "动销数值条件", text: "出库数量：正整数输入，默认 100 件。\n统计时间：正整数输入，默认过去 30 天。\n校验：任一字段小于 1 时显示错误态并阻断保存。", openDrawer: true, sales: true },
  { id: 7, type: "字段", target: "#sampleResultSelect", title: "抽盘结果范围", text: "口径：历史盘点任务的最终结果。\n必填：是。\n默认值：盘平、盘盈、盘亏全部选中。\n交互：下拉多选，标签回显，可单项移除。", openDrawer: true, sample: true },
  { id: 8, type: "字段", target: "#sampleCount", title: "随机抽取数量", text: "口径：从符合条件的历史盘点 SKU 数据池中随机抽取的 SKU 数。\n必填：是；默认 100；仅允许正整数。\n校验：小于 1 时阻断保存。", openDrawer: true, sample: true },
  { id: 9, type: "字段", target: "#channelSelect", title: "指定仓库通道", text: "口径：周期性盘点覆盖的仓库通道。\n必填：是；默认值：A01、A02。\n交互：下拉多选、标签回显，可逐项移除；至少保留一个通道。", openDrawer: true, periodic: true },
  { id: 10, type: "字段", target: "#locationStatusSelect", title: "货位状态", text: "口径：仓库货位主数据的启停状态。\n必填：是；默认值：启用。\n交互：下拉单选，支持启用、停用、全部。", openDrawer: true, periodic: true },
  { id: 11, type: "字段", target: "#varianceRate", title: "历史差异数值条件", text: "盘点差异率：数字输入，默认 2%。\n连续差异次数：正整数输入，默认 2 次。\n统计时间：正整数输入，默认过去 30 天。\n校验：任一配置值小于等于 0 时显示错误态并阻断保存。", openDrawer: true, variance: true },
  { id: 12, type: "字段", target: "#shortageDays", title: "拣货异常数值条件", text: "发生时间：正整数输入，默认过去 7 天。\n缺货次数：正整数输入，默认大于等于 1 次。\n固定事件为拣货缺货，不再单独展示统计事件字段。\n校验：任一配置值小于等于 0 时显示错误态并阻断保存。", openDrawer: true, shortage: true },
  { id: 13, type: "规则", target: ".exclude-box", title: "去重与排除规则", text: "默认剔除近期已完成盘点以及已有待执行/执行中任务的数据，防止同一 SKU + 货位重复生成任务。", openDrawer: true },
  { id: 14, type: "待确认", target: "#schedule", title: "抽盘随机算法", text: "待决问题：随机抽取是否需要按盘平、盘盈、盘亏设置不同抽样比例。\n影响：决定后端抽样算法、结果可复现性及测试用例。", openDrawer: true, sample: true }
];

const annotationColors = { 页面: "page", 字段: "field", 交互: "interaction", 规则: "rule", 待确认: "pending" };
let annotationFilter = "全部";

function annotationClass(type) { return `annotation-${annotationColors[type]}`; }

function ensureAnnotationTarget(item) {
  if (item.openDrawer && !document.querySelector("#drawer").classList.contains("open")) openDrawer();
  if (item.sample) {
    const sample = document.querySelector('[data-type="sample"]');
    if (sample && !sample.classList.contains("selected")) sample.click();
  }
  if (item.sales) {
    const sales = document.querySelector('[data-type="abc"]');
    if (sales && !sales.classList.contains("selected")) sales.click();
  }
  if (item.periodic) {
    const periodic = document.querySelector('[data-type="periodic"]');
    if (periodic && !periodic.classList.contains("selected")) periodic.click();
  }
  if (item.variance) {
    const variance = document.querySelector('[data-type="variance"]');
    if (variance && !variance.classList.contains("selected")) variance.click();
  }
  if (item.shortage) {
    const shortage = document.querySelector('[data-type="shortage"]');
    if (shortage && !shortage.classList.contains("selected")) shortage.click();
  }
  return document.querySelector(item.target);
}

function renderAnnotationFilters() {
  const types = ["全部", "页面", "字段", "交互", "规则", "待确认"];
  document.querySelector("#annotationFilters").innerHTML = types.map(type => {
    const count = type === "全部" ? annotationData.length : annotationData.filter(item => item.type === type).length;
    return `<button class="annotation-filter ${type === annotationFilter ? "active" : ""}" data-filter="${type}" type="button">${type} ${count}</button>`;
  }).join("");
}

function renderAnnotationList() {
  const visible = annotationData.filter(item => annotationFilter === "全部" || item.type === annotationFilter);
  document.querySelector("#annotationList").innerHTML = visible.map(item => `<button class="annotation-item ${annotationClass(item.type)}" data-annotation-id="${item.id}" type="button"><span class="annotation-item__head"><span class="annotation-number">${item.id}</span><h3>${item.title}</h3><span class="annotation-type">${item.type}</span></span><p>${item.text}</p></button>`).join("");
}

function positionAnnotationPoints() {
  if (!document.body.classList.contains("annotation-mode")) return;
  const layer = document.querySelector("#annotationLayer");
  layer.innerHTML = "";
  annotationData.forEach(item => {
    const target = document.querySelector(item.target);
    if (!target || !target.offsetParent) return;
    const rect = target.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const point = document.createElement("button");
    point.type = "button";
    point.className = `annotation-point ${annotationClass(item.type)}`;
    point.dataset.annotationId = item.id;
    point.textContent = item.id;
    point.style.left = `${Math.min(rect.right - 12, innerWidth - 390)}px`;
    point.style.top = `${Math.max(8, rect.top + 8)}px`;
    layer.appendChild(point);
  });
}

function focusAnnotation(id) {
  const item = annotationData.find(entry => entry.id === Number(id));
  if (!item) return;
  const target = ensureAnnotationTarget(item);
  renderAnnotationList();
  requestAnimationFrame(() => {
    const listItem = document.querySelector(`.annotation-item[data-annotation-id="${item.id}"]`);
    listItem?.classList.add("active");
    listItem?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.remove("annotation-target-highlight");
      requestAnimationFrame(() => target.classList.add("annotation-target-highlight"));
      setTimeout(() => target.classList.remove("annotation-target-highlight"), 1600);
    }
    setTimeout(positionAnnotationPoints, 450);
  });
}

function setAnnotationMode(enabled) {
  document.body.classList.toggle("annotation-mode", enabled);
  document.querySelector("#annotationToggle").textContent = enabled ? "关闭标注" : "开启标注";
  setTimeout(positionAnnotationPoints, 230);
}

document.querySelector("#annotationFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  annotationFilter = button.dataset.filter;
  renderAnnotationFilters();
  renderAnnotationList();
});
document.querySelector("#annotationList").addEventListener("click", event => {
  const item = event.target.closest("[data-annotation-id]");
  if (item) focusAnnotation(item.dataset.annotationId);
});
document.querySelector("#annotationLayer").addEventListener("click", event => {
  const point = event.target.closest("[data-annotation-id]");
  if (point) focusAnnotation(point.dataset.annotationId);
});
document.querySelector("#annotationToggle").onclick = () => setAnnotationMode(!document.body.classList.contains("annotation-mode"));
document.querySelector("#annotationClose").onclick = () => setAnnotationMode(false);
addEventListener("scroll", positionAnnotationPoints, true);
addEventListener("resize", positionAnnotationPoints);
renderAnnotationFilters();
renderAnnotationList();
setAnnotationMode(true);
