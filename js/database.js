function autoLink(text) {
    if (!text) return "";
    return text.replace(
        /(https?:\/\/[^\s<>"']+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
}

class TableViewer {
    constructor() {
        this.data = [];
        this.loadCSV();
    }
    loadCSV() {
        Papa.parse('data.csv', {
            header: true,
            download: true,
            complete: (results) => {
                this.data = results.data;
                this.renderTable(this.data);
            },
            error: (err) => {
                document.getElementById("tableResults").innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
            }
        });
    }
    renderTable(data) {
        const tableContainer = document.getElementById("tableResults");
        tableContainer.innerHTML = `
            <table class="table table-hover table-bordered">
                <caption>共找到 ${data.length} 条记录</caption>
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
new TableViewer();
