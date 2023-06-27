window.data = [null, [], []]
const $id = (id) => (document.getElementById(id));

let is_numeric = n => !isNaN(n);

let result_line_num = 0;

/*
  function parseCsvLine from https://zenn.dev/itte/articles/516228940932a5
*/
const parse_csv_line = line => line.split(',').reduce(([data, isInQuotes], text) => {
    if (isInQuotes) {
      data[data.length - 1] += ',' + text.replace(/\"+/g, m => '"'.repeat(m.length / 2))
      return [data, !(text.match(/\"*$/)[0].length % 2)]
    } else {
      const match = text.match(/^(\"?)((.*?)(\"*))$/)
      data.push(match[1] ? match[2].replace(/\"+/g, m => '"'.repeat(m.length / 2)) : match[2])
      return [data, match[1] && !(match[4].length % 2)]
    }
}, [[]])[0]


let read_csv = (file, callback) => {
    let encoding = $id('encoding').value;
    let reader = new FileReader();
    reader.readAsText(file, encoding);
    reader.onload = () => {
        let data = reader.result.trimEnd().replace(/\r/g, '').split('\n');
        callback(data.map(line => parse_csv_line(line)));
    };
};


let filter_history = (file_num, new_filter) => {
    let filters = file_num == 1 ? localStorage.file1_filters : localStorage.file2_filters;
    filters = filters === undefined ? [] : JSON.parse(filters);
    if (new_filter !== undefined) {
        filters = [new_filter].concat(filters.filter(v => v != new_filter));
        let filters_string = JSON.stringify(filters);
        file_num == 1 ? (localStorage.file1_filters = filters_string) : (localStorage.file2_filters = filters_string);
    }
    let ul = $id(`file-${file_num}-filter-history`);
    ul.innerHTML = '';
    filters.forEach(v => {
        let li = document.createElement('li');
        li.innerHTML = '<code>' + v.replace(/\n/g, '<br>') + '</code>';
        li.onclick = () => { $id(`file-${file_num}-filter`).value = v; filter_history(file_num, v); }
        ul.appendChild(li);
    });
};


let clear_filter_history = (file_num) => {
    let ul = $id(`file-${file_num}-filter-history`);
    ul.innerHTML = '';
    file_num == 1 ? (localStorage.file1_filters = '[]') : (localStorage.file2_filters = '[]');
};


let reload_file = (file_num) => {
    let file = $id('file-' + file_num).files[0];
    let header_num = get_header_num(file_num);
    filter_history(file_num, $id('file-' + file_num + '-filter').value);
    read_csv(file, (table) => {
        window.data[file_num] = table.filter((a, i) => (i < header_num || eval($id('file-' + file_num + '-filter').value)));
        update_preview(file_num);
        $id('file-' + file_num + '-len').textContent = window.data[file_num].length - header_num;
    });
};


let file_changed = (e, file_num) => {
    let file = e.files[0];
    let name = file.name.slice(0, -4);

    $id('file-' + file_num + '-name').value = name;
    reload_file(file_num);
};


let save_file = (filename, text) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type: 'application/json'}));
    a.download = filename;    
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};


let save_template_file = () => {
    let file1_filter = $id('file-1-filter').value;
    let file2_filter = $id('file-2-filter').value;
    let filter_obj = {
        "filter1": file1_filter,
        "filter2": file2_filter
    };
    let cdt_file1 = get_column_design_line('cdt-file1');
    let cdt_file2 = get_column_design_line('cdt-file2');
    let cdt_type = get_column_design_line('cdt-type');
    let cdt_header = get_column_design_line('cdt-header');
    let cdt_align = get_column_design_line('cdt-align');
    let cdt_obj = range(0, cdt_file1.length).map(i => ({
        'cdt-file1': cdt_file1[i],
        'cdt-file2': cdt_file2[i],
        'cdt-type': cdt_type[i],
        'cdt-header': cdt_header[i],
        'cdt-align': cdt_align[i]
    }));
    let template_obj = {
        "file-select": filter_obj,
        "cdt": cdt_obj
    };
    save_file('template.json', JSON.stringify(template_obj, null, 4));
};


let load_template_file = () => {
    let input = $id('template-file');
    let file = input.files[0];
    if (file === undefined) {
        alert('ファイルが空です。');
        return;
    }
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
        let template_obj = JSON.parse(reader.result);
        if ($id('template-file-select').checked) {
            let filter_obj = 'file-select' in template_obj ? template_obj['file-select'] : [];
            $id('file-1-filter').value = filter_obj['filter1'] || '';
            $id('file-2-filter').value = filter_obj['filter2'] || '';
        }
        if ($id('template-cdt').checked) {
            let cdt_obj = 'cdt' in template_obj ? template_obj['cdt'] : [];
            let row_diff = cdt_obj.length - column_design_table_row_num() + 1;
            if (row_diff > 0) {
                range(0, row_diff).forEach(() => add_column());
            }
            else {
                range(0, -row_diff).forEach(() => reduce_column());
            }
            [...$id('cdt-file1').children].slice(1).forEach((td, i) => {
                td.children[0].textContent = 'cdt-file1' in cdt_obj[i] ? cdt_obj[i]['cdt-file1'] : '';
            });
            [...$id('cdt-file2').children].slice(1).forEach((td, i) => {
                td.children[0].textContent = 'cdt-file2' in cdt_obj[i] ? cdt_obj[i]['cdt-file2'] : '';
            });
            [...$id('cdt-type').children].slice(1).forEach((td, i) => {
                td.children[0].value = 'cdt-type' in cdt_obj[i] ? cdt_obj[i]['cdt-type'] : 'key';
            });
            [...$id('cdt-header').children].slice(1).forEach((td, i) => {
                td.children[0].innerHTML = 'cdt-header' in cdt_obj[i] ? cdt_obj[i]['cdt-header'].replace(/\n/g, '<br>') : '';
            });
            [...$id('cdt-align').children].slice(1).forEach((td, i) => {
                td.children[0].value = 'cdt-align' in cdt_obj[i] ? cdt_obj[i]['cdt-align'] : 'auto';
            });
            check_cdt();
        }
        input.value = '';
    };
};


let get_header_num = (file_num) => {
    return +$id('file-' + file_num + '-header-num').value;
};


let get_preview_num = (file_num, max) => {
    let num = $id('file-' + file_num + '-preview-num').value;
    if (num == 'all') {
        return max;
    }
    else {
        return Math.min(max, +num);
    }
};


let update_preview = (file_num) => {
    let table = $id('file-' + file_num + '-preview');
    let header_num_input = $id('file-' + file_num + '-header-num')
    let header_num = Math.max(+header_num_input.value, 0);
    header_num_input.value = header_num;
    let id_header = '<tr>' + '<th></th>' + window.data[file_num][0].map((v, i) => `<th>#${i}</th>`).join('') + '</tr>';
    let headers = window.data[file_num].slice(0, header_num).map((v) => {
        return '<tr>' + '<th></th>' + v.map(c => '<th>' + c + '</th>').join('') + '</tr>'
    });
    let preview_num = get_preview_num(file_num, window.data[file_num].length - header_num);
    let lines = window.data[file_num].slice(header_num, header_num + preview_num).map((v, i) => {
        return '<tr>' + `<td>${i+1}</td>` + v.map(c => `<td ${is_numeric(c) ? 'class="align-right"' : ''}>` + c + '</td>').join('') + '</tr>'
    });
    table.innerHTML = `<thead>${id_header}${headers.join('')}</thead>` + `<tbody>${lines.join('')}</tbody>`;
};


let column_design_table_row_num = () => {
    return $id('cdt-file1').children.length;
};


let show_suggest = (e, file_num) => {
    let ul = e.nextElementSibling;
    ul.innerHTML = '';
    ul.classList.remove('none');
    
    let header_num = get_header_num(file_num);
    let column_num = window.data[file_num][0].length;
    let header = range(0, column_num).map(j => range(0, header_num).map(i => window.data[file_num][i][j]).join(','));

    header.forEach((header, i) => {
        let li = document.createElement('li');
        li.textContent = `#${i} (${header})`;
        li.onclick = () => {
            switch (get_parse_type(e.textContent)) {
                case ParseType.SINGLE:
                    e.textContent = `#${i}(${header})`;
                    break;
                default:
                    e.textContent += `#${i}(${header})`;
                    break;
            }
            check_cdt();
        };
        ul.appendChild(li);
    });
};


let hide_suggest = e => {
    // console.log(e);
    let ul = e.nextElementSibling;
    setTimeout(() => {
        ul.classList.add('none');
        ul.innerHTML = '';
    }, 150);
};


let add_drag_events = (e, i, tds) => {
    e.onclick = () => console.log('clicked')
    e.ondragstart = event => {
        event.dataTransfer.setData('text/plain', i);
        console.log('start')
    };
    e.ondragover = event => {
        event.preventDefault();
        let rect = e.getBoundingClientRect();
        if ((event.clientX - rect.left) < rect.width / 2) {
            e.style.borderLeft = 'solid 3px #333';
            e.style.borderRight = '';
        }
        else {
            e.style.borderLeft = '';
            e.style.borderRight = 'solid 3px #333';
        }

    };
    e.ondragleave = event => {
        e.style.borderLeft = '';
        e.style.borderRight = '';
    };
    e.ondrop = event => {
        event.preventDefault();
        let moving_i = +event.dataTransfer.getData('text/plain');
        let rect = e.getBoundingClientRect();

        if ((event.clientX - rect.left) < rect.width / 2) {
            move_column(moving_i, i, true);
        }
        else {
            console.log('r', i + 1, moving_i);
            move_column(moving_i, i, false);
        }

        e.style.borderLeft = '';
        e.style.borderRight = '';
    };
    let move_column = (from, to, is_before) => {
        let move_td = tds => tds[to].parentNode.insertBefore(tds[from], is_before ? tds[to] : tds[to].nextSibling);

        move_td(document.querySelectorAll('#cdt-file1 td'));
        move_td(document.querySelectorAll('#cdt-file2 td'));
        move_td(document.querySelectorAll('#cdt-type td'));
        move_td(document.querySelectorAll('#cdt-header td'));
    }
}

let add_cdt_events = () => {
    document.querySelectorAll('#cdt-moving-column td').forEach(add_drag_events);
    document.querySelectorAll('#cdt td').forEach(e => e.oninput = check_cdt);
    document.querySelectorAll('#cdt-file1 td span').forEach(e => e.onfocus = () => show_suggest(e, 1));
    document.querySelectorAll('#cdt-file1 td span').forEach(e => e.onblur = () => hide_suggest(e));
    document.querySelectorAll('#cdt-file2 td span').forEach(e => e.onfocus = () => show_suggest(e, 2));
    document.querySelectorAll('#cdt-file2 td span').forEach(e => e.onblur = () => hide_suggest(e));
};

let add_column = () => {
    $id('cdt-moving-column').insertAdjacentHTML('beforeend', '<td draggable="true"></td>');
    $id('cdt-file1').insertAdjacentHTML('beforeend', '<td><span contentEditable="true"></span><ul class="none"></ul></td>');
    $id('cdt-file2').insertAdjacentHTML('beforeend', '<td><span contentEditable="true"></span><ul class="none"></ul></td>');
    $id('cdt-type').insertAdjacentHTML('beforeend', '<td><select><option value="key">キー</option><option value="compare">比較</option><option value="show">表示</option><option value="disable">無効</option></select></td>');
    $id('cdt-header').insertAdjacentHTML('beforeend', '<td><span contentEditable="true"></span></td>');
    $id('cdt-align').insertAdjacentHTML('beforeend', '<td><select><option value="auto">自動</option><option value="left">左揃え</option><option value="center">中央揃え</option><option value="right">右揃え</option></select></td>');
    add_cdt_events();
    check_cdt();
};


let reduce_column = () => {
    let last_index = column_design_table_row_num() - 1;
    if (last_index > 1) {
        $id('cdt-moving-column').children[last_index].remove();
        $id('cdt-file1').children[last_index].remove();
        $id('cdt-file2').children[last_index].remove();
        $id('cdt-type').children[last_index].remove();
        $id('cdt-header').children[last_index].remove();
        $id('cdt-align').children[last_index].remove();
    }
    check_cdt();
};


let get_column_design_line = (name) => {
    let line = [...$id(name).children].slice(1);
    switch (name) {
        case 'cdt-file1':
        case 'cdt-file2':
            return line.map(e => e.children[0].textContent);
        
        case 'cdt-type':
        case 'cdt-align':
                return line.map(e => e.children[0].value);

        case 'cdt-header':
            return line.map(e => e.children[0].innerHTML.replaceAll('<br>', '\n'));
        }
    return [];
};


const ParseType = Object.freeze({
    FORMULA: 0,
    SINGLE: 1,
    MULTIPLE: 2,
    ERROR: 3
});


let get_parse_type = (equation) => {
    if (equation[0] == '=') {
        return ParseType.FORMULA;
    }
    if (equation.match(/^#[0-9]+(\([^)]*\))?$/g) !== null) {
        return ParseType.SINGLE;
    }
    if (equation.match(/^#[0-9]+(\([^)]*\))?-#[0-9]+(\([^)]*\))?$/g) !== null) {
        return ParseType.MULTIPLE;
    }
    return ParseType.ERROR;
};

const range = (from, to) => [...Array(to).keys()].slice(from);

let parser = (equation) => {
    switch(get_parse_type(equation)) {
        case ParseType.FORMULA:
            return [a => eval(equation.slice(1).replace(/#([0-9]+)(\([^)]*\))?/g, 'a[$1]'))];

        case ParseType.SINGLE:
            // return [a => a[+equation.slice(1)]];
            return [a => a[+equation.match(/^#([0-9]+)(\([^)]*\))?$/)[1]]];

        case ParseType.MULTIPLE:
            // let from_to = equation.replaceAll('#', '').split('-').map(a => +a);
            let from_to = equation.replace(/^#([0-9]+)(\([^)]*\))?-#([0-9]+)(\([^)]*\))?$/g, '$1-$3').split('-').map(a => +a);
            
            return range(from_to[0], from_to[1] + 1).map(i => (a => a[i]));

        case ParseType.ERROR:
            return a => [];
    }
};

let parse_all = () => {
    let cdt = {'cdt-file1': [], 'cdt-file2': [], 'cdt-type': [], 'cdt-header': [], 'cdt-align': []};
    let cdt_file1 = get_column_design_line('cdt-file1');
    let cdt_file2 = get_column_design_line('cdt-file2');
    let cdt_type = get_column_design_line('cdt-type');
    let cdt_header = get_column_design_line('cdt-header');
    let cdt_align = get_column_design_line('cdt-align');

    cdt_type.forEach((type, i) => {
        if (type != 'disable') {
            let file1_parsed = parser(cdt_file1[i]);
            cdt['cdt-file1'] = cdt['cdt-file1'].concat(file1_parsed);
            cdt['cdt-file2'] = cdt['cdt-file2'].concat(parser(cdt_file2[i]));
            cdt['cdt-type'] = cdt['cdt-type'].concat( file1_parsed.fill(cdt_type[i]) );
            cdt['cdt-header'] = cdt['cdt-header'].concat( file1_parsed.map((v, j) => cdt_header[i].split('\n').concat(file1_parsed.fill(''))[j]) )
            cdt['cdt-align'] = cdt['cdt-align'].concat( file1_parsed.fill(cdt_align[i]) );
        }
    });

    return cdt;
};


let get_column_num = (equation) => {
    return parser(equation).length;
};


let autofill_file2 = () => {
    let searching_range = range(0, get_header_num(2)).toReversed();
    let search = value => {
        for (let i of searching_range) {
            let index = window.data[2][i].indexOf(value);
            if (index != -1) return index;
        }
        return -1
    };
    let file1_header = get_column_design_line('cdt-file1');
    let file1_last_header_num = Math.max(get_header_num(1) - 1, 0);
    let file1_header_labels = window.data[1][file1_last_header_num];
    let cdt_file2 = $id('cdt-file2');
    file1_header.forEach((h, i) => {
        switch (get_parse_type(h)) {
            case ParseType.SINGLE:
                // a = parser(h).map(p => search(p(file1_header_labels)));
                let label = search(parser(h)[0](file1_header_labels));
                if (label != -1) {
                    cdt_file2.children[i + 1].children[0].textContent = `#${label}`;
                }
                break;
            case ParseType.MULTIPLE:
                let labels = parser(h).map(p => search(p(file1_header_labels)));
                if (labels[0] != -1 && labels[labels.length-1] != -1) {
                    cdt_file2.children[i + 1].children[0].textContent = `#${labels[0]}-#${labels[labels.length-1]}`;
                }
                break;
        }
    });
    check_cdt();
};


let get_file_last_header_labels = (file_num) => {
    let file_last_header_num = get_header_num(file_num) - 1;
    if (file_last_header_num < 0) {
        return Array(window.data[file_num][0].length).fill('');
    }
    else {
        return window.data[file_num][file_last_header_num];
    }
};


let autofill_header = () => {
    let file2_header = get_column_design_line('cdt-file2');
    let file2_header_labels = get_file_last_header_labels(2);
    let output_header = $id('cdt-header');
    file2_header.forEach((h, i) => {
        switch(get_parse_type(h)) {
            case ParseType.SINGLE:
            case ParseType.MULTIPLE:
                let labels = parser(h).map(p => p(file2_header_labels));
                output_header.children[i + 1].children[0].innerHTML = labels.join('<br>');
        }
    });
};


// カラム設計をチェック
let check_cdt = () => {
    let reset_error = () => {
        [...$id('cdt-file1').children].slice(1).forEach(e => e.children[0].classList.remove('error'));
        [...$id('cdt-file2').children].slice(1).forEach(e => e.children[0].classList.remove('error'));
        $id('cdt-error').innerHTML = '';
    };

    let output_error = (name, i, message) => {
        let tr = $id(name);
        let label = tr.children[0].textContent.split(' ')[0];
        [...tr.children].slice(1)[i].children[0].classList.add('error');
        $id('cdt-error').insertAdjacentHTML('beforeend', `<li>${label}: 列${i}: ${message}</li>`);
    };

    reset_error();

    let file1_column_nums = get_column_design_line('cdt-file1').map(v => get_column_num(v));
    let cdt_type_line = get_column_design_line('cdt-type');

    get_column_design_line('cdt-file1').forEach((v, i) => {
        if (cdt_type_line[i] != 'disable') {
            if (v === "") {
                output_error('cdt-file1', i, `空欄になっています。`);
            }
            else if (get_parse_type(v) == ParseType.ERROR) {
                output_error('cdt-file1', i, `"${v}": 文法が正しくありません。`);
            }
        }
    });

    get_column_design_line('cdt-file2').forEach((v, i) => {
        if (cdt_type_line[i] != 'disable') {
            let parse_type = get_parse_type(v);
            if (v === "") {
                output_error('cdt-file2', i, `空欄になっています。`);
            }
            else if (parse_type == ParseType.ERROR) {
                output_error('cdt-file2', i, `"${v}": 文法が正しくありません。`);
            }
            else if (file1_column_nums[i] != get_column_num(v) && file1_column_nums[i] > 0) {
                output_error('cdt-file2', i, `"${v}": ファイル1とファイル2のカラム数が合っていません。`);
            }
        }
    });
};


let get_key_funcs = (cdt, name) => cdt[name].filter((v, i) => cdt['cdt-type'][i] == 'key');
let create_key = (key_funcs, line) => key_funcs.map(f => f(line)).join(',');

let check_key = (cdt) => {

    let _check_key = (n, name, label) => {
        let key_funcs = get_key_funcs(cdt, name);
        let set = new Set();
        for (let line of window.data[n]) {
            let key = create_key(key_funcs, line);
            if (set.has(key)) {
                compare_log(`キー重複: ${label}: ${key}`, LogType.ERROR, true);
                return false;
            }
            set.add(key);
        }
    };

    if (_check_key(1, 'cdt-file1', 'ファイル1') == false) {
        return false;
    }
    if (_check_key(2, 'cdt-file2', 'ファイル2') == false) {
        return false;
    }
};


let reset_result = (cdt) => {
    let is_side_by_side = $id('show-side-by-side').checked;
    let ths = ['<th>#</th>'];
    let ths_from_cdt = cdt['cdt-header'].map(c => `<th>${c}</th>`);
    if (is_side_by_side) {
        ths = ths.concat(['<th></th>']).concat(ths_from_cdt).concat(get_file_last_header_labels(1).map(c => `<th class="original-column">${c}</th>`));
        ths = ths.concat(['<th></th>']).concat(ths_from_cdt).concat(get_file_last_header_labels(2).map(c => `<th class="original-column">${c}</th>`));
    }
    else {
        ths = ths.concat(['<th></th>']).concat(ths_from_cdt);
    }
    $id('result-head').innerHTML = '<tr>' + ths.join('') + '</tr>';
    $id('result-body').innerHTML = '';
    result_line_num = 1;
};

let output_result_line = (cdt, line1, line2, filling_num) => {
    let trs = [];
    let convert_line = (line, name) => cdt[name].map(f => f(line));
    let is_side_by_side = $id('show-side-by-side').checked;
    let get_align_classname = (value, index) => {
        if (cdt['cdt-align'][index] == 'auto') {
            if (cdt['cdt-type'][index] == 'key') {
                return 'align-left';
            }
            return is_numeric(value) ? 'align-right' : 'align-left';
        }
        return `align-${cdt['cdt-align'][index]}`;
    };
    if (line1 != null && line2 == null) {
        if ($id('show-key-exists-only-file1').checked) {
            tds = ['<th>' + $id('file-1-name').value + '</th>'];
            tds = tds.concat( convert_line(line1, 'cdt-file1').map((c, i) => `<td class="delete ${get_align_classname(c, i)}">${c}</td>`) );
            if (is_side_by_side) {
                tds = tds.concat( line1.map(c => `<td>${c}</td>`) );
                tds.push('<th></th>');
                tds = tds.concat( Array(cdt['cdt-file2'].length).fill('<td></td>') );
                tds = tds.concat( Array(filling_num).fill('<td></td>') );
            }
            trs = ['<tr class="upper-border lower-border">' + `<th>${result_line_num++}</th>` + tds.join('') + '</tr>'];
        }
    }
    else if (line1 == null && line2 != null) {
        if ($id('show-key-exists-only-file2').checked) {
            let tds = [];
            if (is_side_by_side) {
                tds = ['<th></th>'];
                tds = tds.concat( Array(cdt['cdt-file1'].length).fill('<td></td>') );
                tds = tds.concat( Array(filling_num).fill('<td></td>') );
            }
            tds.push('<th>' + $id('file-2-name').value + '</th>');
            tds = tds.concat(convert_line(line2, 'cdt-file2').map((c, i) => `<td class="add ${get_align_classname(c, i)}">${c}</td>`).join(''));
            if (is_side_by_side) {
                tds = tds.concat( line2.map(c => `<td>${c}</td>`) );
            }
            trs = ['<tr class="upper-border lower-border">' + `<th>${result_line_num++}</th>` + tds.join('') + '</tr>'];
        }
    }
    else {
        let converted_line1 = convert_line(line1, 'cdt-file1');
        let converted_line2 = convert_line(line2, 'cdt-file2');
        let tds1 = ['<th>' + $id('file-1-name').value + '</th>'];
        let tds2 = ['<th>' + $id('file-2-name').value + '</th>'];
        let is_any_different = false;
        converted_line1.forEach((c1, i) => {
            let c2 = converted_line2[i];
            let is_different = cdt['cdt-type'][i] == 'compare' && c1 != c2;
            is_any_different = is_different || is_any_different;
            tds1.push(`<td class="${is_different ? 'delete': ''} ${get_align_classname(c1, i)}">${c1}</td>`);
            tds2.push(`<td class="${is_different ? 'add': ''} ${get_align_classname(c2, i)}">${c2}</td>`);
        });
        if ($id('show-match-line').checked || is_any_different) {
            if (is_side_by_side) {
                tds1 = tds1.concat( line1.map(c => `<td>${c}</td>`) );
                tds2 = tds2.concat( line2.map(c => `<td>${c}</td>`) );
                trs = ['<tr class="upper-border lower-border">' + `<th>${result_line_num++}</th>` + tds1.join('') + tds2.join('') + '</tr>'];
            }
            else {
                trs = [
                    '<tr class="upper-border">' + `<th>${result_line_num}</th>` + tds1.join('') + '</tr>',
                    '<tr class="lower-border">' + `<th>${result_line_num++}</th>` + tds2.join('') + '</tr>'
                ];
            }
        }
    }
    $id('result-body').insertAdjacentHTML('beforeend', trs.join(''));
};


let compare = () => {
    compare_log('比較を開始します。', LogType.LOG);
    cdt = parse_all();
    if (check_key(cdt) == false) {
        return;
    }
    reset_result(cdt);

    let file2_key_funcs = get_key_funcs(cdt, 'cdt-file2');
    let file2_header_num = get_header_num(2);
    let file2_key2lines = window.data[2].slice(file2_header_num).reduce((a, line) => { a[create_key(file2_key_funcs, line)] = line; return a; }, {});

    let file1_key_funcs = get_key_funcs(cdt, 'cdt-file1');
    let file1_header_num = get_header_num(1);

    let line1_num = window.data[1][0].length;
    let line2_num = window.data[2][0].length;

    window.data[1].slice(file1_header_num).forEach((line, i) => {
        let key = create_key(file1_key_funcs, line);
        if (key in file2_key2lines) {  // file1のkeyがfile2にある
            output_result_line(cdt, line, file2_key2lines[key]);
            delete file2_key2lines[key];
        }
        else {
            output_result_line(cdt, line, null, line2_num);
        }
    });
    for (let key in file2_key2lines) {
        output_result_line(cdt, null, file2_key2lines[key], line1_num);
    }
    compare_log('比較を完了しました。', LogType.LOG, true);
};


const LogType = Object.freeze({
    LOG: 0,
    WARNING: 1,
    ERROR: 2,
});


let compare_log = (text, type, is_scroll_to_bottom) => {
    let class_name = '';
    switch (type) {
        case LogType.LOG: class_name = ''; break;
        case LogType.WARNING: class_name = 'warning'; break;
        case LogType.ERROR: class_name = 'error'; break;
        default: console.error('key not found'); break;
    }
    let date = new Date();
    let timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    let ul = $id('compare-log');
    ul.insertAdjacentHTML('beforeend', `<li class="${class_name}">[${timestamp}] ${text}</li>`);
    if (is_scroll_to_bottom) {
        ul.scrollTo(0, ul.scrollHeight);
    }
}

let copy_result = () => {
    let r = document.createRange();
    r.selectNodeContents($id('result'));
    let s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    navigator.clipboard.writeText(s);
    s.removeAllRanges();
};

let loaded = () => {
    $id('file-1').onchange = (event) => file_changed(event.target, 1);
    $id('file-2').onchange = (event) => file_changed(event.target, 2);
    $id('file-1-header-num').onchange = (event) => update_preview(1);
    $id('file-2-header-num').onchange = (event) => update_preview(2);
    $id('file-1-reload').onclick = (event) => reload_file(1);
    $id('file-2-reload').onclick = (event) => reload_file(2);
    $id('file-1-clear-filter-history').onclick = () => clear_filter_history(1);
    $id('file-2-clear-filter-history').onclick = () => clear_filter_history(2);
    $id('file-1-preview-num').onchange = () => update_preview(1);
    $id('file-2-preview-num').onchange = () => update_preview(2);
    $id('save-template-file').onclick = () => save_template_file();
    $id('load-template-file').onclick = () => load_template_file();
    $id('add-column').onclick = () => add_column();
    $id('reduce-column').onclick = () => reduce_column();
    $id('autofill-file2').onclick = () => autofill_file2();
    $id('autofill-header').onclick = () => autofill_header();
    $id('compare').onclick = () => compare();
    $id('copy').onclick = () => copy_result();
    add_cdt_events();
    filter_history(1);
    filter_history(2);
};

window.onload = loaded();



// // DEBUG
// window.data = [
//     [],
//     [["h1", "h2", "h3"], ["key1","0","1"],["key2","2","3"], ["key3", "0", "0"]],
//     [["h1", "h2", "h4"], ["key1","0","1"],["key2","2","4"], ["key4", "0", "0"]]
// ]
// compare()

