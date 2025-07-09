// 自动识别http/https为超链接
function autoLink(text) {
    if (!text) return "";
    return text.replace(
        /(https?:\/\/[^\s<>"']+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
}

// 返回顶部按钮功能
document.addEventListener("DOMContentLoaded", function () {
    const backToTop = document.getElementById("backToTop");
    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            backToTop.style.display = "block";
        } else {
            backToTop.style.display = "none";
        }
    });
    backToTop.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});

class AlertHandler {
    show(message) {
        document.getElementById("alerts").innerHTML =
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
    }
    clear() {
        document.getElementById("alerts").innerHTML = "";
    }
}
const alertHandler = new AlertHandler();

// --- 下面是纯静态CSV搜索部分 ---
let allData = [];

// 读取CSV文件并解析
function loadData(callback) {
    Papa.parse('data.csv', {
        download: true,
        header: true,
        encoding: "utf-8",
        complete: function(results) {
            allData = results.data.filter(row => row.en_name || row.zh_name); // 过滤空行
            callback(allData);
        },
        error: function(err) {
            alertHandler.show("数据加载失败：" + err.message);
        }
    });
}

// 渲染表格
function updateTable(data) {
    const tableContainer = document.getElementById("tableResults");
    tableContainer.innerHTML = `
        <table class="table table-hover table-bordered">
            <caption>${data.length === 0 ? "没有相关记录。" : `共找到 ${data.length} 条记录`}</caption>
            <thead>
                <tr>
                    <th style="width:15%;">英文名</th>
                    <th style="width:15%;">中文名</th>
                    <th style="width:35%;">概述</th>
                    <th style="width:35%;">相关</th>
                </tr>
            </thead>
            <tbody>
            ${
                data.length === 0
                    ? `<tr><td colspan="4" class="text-center text-muted">无结果</td></tr>`
                    : data.map(row => `
                        <tr>
                            <td style="width:15%;">${row.en_name || ""}</td>
                            <td style="width:15%;">${row.zh_name || ""}</td>
                            <td style="width:35%;">${autoLink(row.summary || "")}</td>
                            <td style="width:35%;">${autoLink(row.related || "")}</td>
                        </tr>
                    `).join("")
            }
            </tbody>
        </table>
    `;
}

// 搜索功能
function search(keyword) {
    keyword = (keyword || "").trim().toLowerCase();
    const result = allData.filter(row =>
        (row.en_name || "").toLowerCase().includes(keyword) ||
        (row.zh_name || "").toLowerCase().includes(keyword) ||
        (row.summary || "").toLowerCase().includes(keyword) ||
        (row.related || "").toLowerCase().includes(keyword)
    );
    updateTable(result);
}

// 页面加载完毕，初始化
window.onload = function() {
    loadData(updateTable);

    document.getElementById("btnSubmit").addEventListener("click", function() {
        const keyword = document.getElementById("inputSearch").value;
        search(keyword);
    });
    document.getElementById("inputSearch").addEventListener("keyup", function(e) {
        if (e.key === "Enter") document.getElementById("btnSubmit").click();
    });
};
