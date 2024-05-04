var loadProjects = {
    div: document.getElementById('projects'),
    ul: document.getElementById('projects').querySelector('ul'),
    add: function (titleContent, onclick = (title) => { }, ondel = (title) => { }) {
        let item = document.createElement('li');
        let titlediv = document.createElement('div');
        titlediv.textContent = titleContent;
        let deldiv = document.createElement('div');
        deldiv.textContent = 'x';
        deldiv.addEventListener('click', (e) => {
            if (confirm(`确定要删除项目 ‘${titleContent}’ 吗?`)) {
                ondel(titleContent);
                e.target.parentNode.remove();
            }
        });
        item.addEventListener('click', (e) => {
            if (e.target != deldiv) {    // 防止点击删除按钮时一起响应
                onclick(titleContent);
            }
        })
        item.appendChild(titlediv);
        item.appendChild(deldiv);
        this.ul.appendChild(item);
    },
    show: function () {
        this.div.style.display = 'block';
        setTimeout(() => {
            this.div.style.opacity = 1;
            document.addEventListener('click', this.hideOnclick);
        }, 1);
    },
    hide: function () {
        this.div.style.opacity = 0;
        document.removeEventListener('click', this.hideOnclick);
        setTimeout(() => {
            this.div.style.display = 'none';
        }, 200);
    },
    hideOnclick: function (e) {
        if (loadProjects.getStatus()) loadProjects.hide();  // 点击任何地方都隐藏
        // if (!loadProjects.div.contains(e.target) && loadProjects.getStatus()) loadProjects.hide();
    },
    getStatus: function () {
        return this.div.style.display == 'block';
    }
}