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
        this.currentIndex = 0;
        this.pageSize = 50; // 每次显示50条
        this.loadCSV();
    }
    loadCSV() {
        Papa.parse('data.csv', {
            header: true,
            download: true,
            complete: (results) => {
                this.data = results.data;
                this.currentIndex = 0;
                this.renderTable();
            },
            error: (err) => {
                document.getElementById("tableResults").innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
            }
        });
    }
    renderTable() {
        const tableContainer = document.getElementById("tableResults");
        const sliceData = this.data.slice(0, this.currentIndex + this.pageSize);

        let html = `
            <table class="table table-hover table-bordered">
                <caption>共找到 ${this.data.length} 条记录，已显示 ${sliceData.length} 条</caption>
                <thead>
                    <tr>
                        <th style="width:15%;">英文名</th>
                        <th style="width:15%;">中文名</th>
                        <th style="width:35%;">概述</th>
                        <th style="width:35%;">相关</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (sliceData.length === 0) {
            html += `<tr><td colspan="4" class="text-center text-muted">无结果</td></tr>`;
        } else {
            html += sliceData.map((row, idx) => {
                // 已经渲染过的不用动画，新渲染的加动画
                const fadeClass = (idx >= this.currentIndex) ? "fade-in" : "";
                return `
                    <tr class="${fadeClass}">
                        <td data-label="英文名" style="width:15%;">${row.en_name || ""}</td>
                        <td data-label="中文名" style="width:15%;">${row.zh_name || ""}</td>
                        <td data-label="概述" style="width:35%;">${autoLink(row.summary || "")}</td>
                        <td data-label="相关" style="width:35%;">${autoLink(row.related || "")}</td>
                    </tr>
                `;
            }).join("");
            
        }

        html += `
                </tbody>
            </table>
        `;

        // 加载更多按钮
        if (sliceData.length < this.data.length) {
            html += `<div style="text-align:center;margin:18px 0;">
                        <button id="loadMoreBtn" class="btn btn-outline-success btn-lg">加载更多（剩余${this.data.length - sliceData.length}条）</button>
                    </div>`;
        } else if(this.data.length > 0){
            html += `<div style="text-align:center;margin:18px 0;color:#59b39a;">已全部加载完毕</div>`;
        }

        tableContainer.innerHTML = html;

        // 按钮事件绑定
        if (document.getElementById('loadMoreBtn')) {
            document.getElementById('loadMoreBtn').onclick = () => {
                this.currentIndex += this.pageSize;
                this.renderTable();
            };
        }
    }
}
new TableViewer();
