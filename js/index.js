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

class APIHandler {
    constructor() {
        this.data = [];
        this.loaded = false;
        this.loadCSV();
    }
    loadCSV() {
        Papa.parse('data.csv', {
            header: true,
            download: true,
            complete: (results) => {
                this.data = results.data;
                this.loaded = true;
            },
            error: (err) => {
                alertHandler.show("数据加载失败: " + err.message);
            }
        });
    }
    search(keyword) {
        if (!this.loaded) {
            alertHandler.show("数据还未加载完成，请稍等...");
            return;
        }
        const kw = (keyword || "").toLowerCase();
        if (!kw) {
            document.getElementById("tableResults").style.display = "none";
            this.updateTable([]); // 清空
            return;
        }
        const res = this.data.filter(row =>
            (row.en_name && row.en_name.toLowerCase().includes(kw)) ||
            (row.zh_name && row.zh_name.toLowerCase().includes(kw)) ||
            (row.summary && row.summary.toLowerCase().includes(kw)) ||
            (row.related && row.related.toLowerCase().includes(kw))
        );
        this.updateTable(res);
        document.getElementById("tableResults").style.display = "block";
    }
    updateTable(data) {
        const tableContainer = document.getElementById("tableResults");
        if (!data || data.length === 0) {
            tableContainer.innerHTML = "";
            return;
        }
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
                                <td data-label="英文名" style="width:15%;">${row.en_name || ""}</td>
                                <td data-label="中文名" style="width:15%;">${row.zh_name || ""}</td>
                                <td data-label="概述" style="width:35%;">${autoLink(row.summary || "")}</td>
                                <td data-label="相关" style="width:35%;">${autoLink(row.related || "")}</td>
                            </tr>
                        `).join("")
                }
                </tbody>
            </table>
        `;
    }
}

const apiHandler = new APIHandler();

document.getElementById("btnSubmit").addEventListener("click", function() {
    const keyword = document.getElementById("inputSearch").value.trim();
    apiHandler.search(keyword);
});
document.getElementById("inputSearch").addEventListener("keyup", function(e) {
    if (e.key === "Enter") document.getElementById("btnSubmit").click();
});
document.getElementById("inputSearch").addEventListener("input", function() {
    if (this.value.trim() === "") {
        document.getElementById('tableResults').style.display = 'none';
    }
});
