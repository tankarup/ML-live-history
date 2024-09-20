let setori = [];
let cvs = [];
let color = {};

function init(){
    init_cv();
    init_color();
    init_setori();
    init_selecter();
    init_live_list();
    //set_content();
};

function init_live_list(){
    let live_lists = [];
    for (const song of setori){
        live_lists.push(song.live);
    }
    const lives = Array.from(new Set(live_lists));
    
    let html = '';
    html += '<ul>';
    for (const live of lives){
        html += `<li>${live}</li>`
    }
    html +='</ul>';
    document.getElementById('live_list').innerHTML = html;
}

function init_cv(){
    const lines = cv_data.split('\n');
    for (const line of lines){
        const items = line.split('\t');
        if (items.length < 2) continue;
        cvs.push(
            {
                name: items[0],
                color: items[1],
                character: items[2],
            }
        );
    }
}

function init_color(){
    for (const cv of cvs){
        color[cv.name] = cv.color;
    }
}

function init_setori(){
    const lines = data.split('\n');
    for ( const line of lines ){
        const items = line.split('\t');
        if (items.length < 6) continue;
        setori.push(
            {
                live: items[0],
                part: items[1],
                date: items[2],
                order: items[3],
                name: items[4],
                version: items[5],
                singers: items[6].trim().split(/\s*,\s*/),
                singers_text: items[6],
            }
        )
    }
}

function init_selecter(){
    const element = document.getElementById('cv_select');
    for (const cv of cvs){
        const op = document.createElement('option');
        op.text = `${cv.name} (${cv.character} 役)`;
        op.value = cv.name;
        op.setAttribute('style', `color: ${color[cv.name]};`);
        element.appendChild(op);
    }

    {
        const op = document.createElement('option');
        op.text = '全員';
        //op.setAttribute('style', `color: ${color[cv.name]};`);
        element.appendChild(op);
    }

    element.addEventListener('change', (event) => {
        set_content(event.target.value);
    });

    //ランダム選択
    element.value =  cvs[Math.floor(Math.random() * cvs.length)].name;
    set_content(element.value);

}
function set_content(cv_name){
    set_list(cv_name);
    set_summary(cv_name);
}

function is_singer_included(text, name){
    if (name === '全員') return true;
    if (name === '愛美'){
        return (text.replace('沼倉愛美', '').indexOf('愛美') > -1)
    }
    return (text.indexOf(name) > -1)
}
function set_summary(cv_name){
    set_count(cv_name);
    set_cosinger(cv_name);
}

function set_cosinger(cv_name){
    let cosinger_count = {};

    for (const song of setori){
        if (is_singer_included(song.singers_text, cv_name)){
            for (const cv of cvs){
                if(is_singer_included(song.singers_text, cv.name)){
                    cosinger_count[cv.name] = (cosinger_count[cv.name] || 0) + 1;
                }
            }
        }
    }

    let cosinger_count_lists = [];
    for (const name in cosinger_count){
        cosinger_count_lists.push(
            {
                name:name,
                count:cosinger_count[name],
            }
        )
    }
    cosinger_count_lists.sort(function(a,b){
        return b.count - a.count;
    })

    let html = '<h2 class="bg-info text-light h4">一緒に歌った回数</h2>';
    html += '<table class="table table-striped">';
    for (const cosinger of cosinger_count_lists){
        html += `
            <tr>
                <td><span style="color: ${color[cosinger.name]};" class="idol_name">${cosinger.name}</span></td>
                <td>${cosinger.count}</td>
            </tr>
        `;
    }
    html += '</table>';

    const element = document.getElementById('cosinger');
    element.innerHTML = html;
}
function set_count(cv_name){
    

    let song_count = {};

    for (const song of setori){
        if (is_singer_included(song.singers_text, cv_name)){
            song_count[song.name] = (song_count[song.name] || 0) + 1;
        }
    }

    let song_count_lists = [];
    for (const name in song_count){
        song_count_lists.push(
            {
                name:name,
                count:song_count[name],
            }
        )
    }
    song_count_lists.sort(function(a,b){
        return b.count - a.count;
    }

    )

    let html = '<h2 class="bg-info text-light h4">歌唱回数</h2>';
    html += '<table class="table table-striped">';
    for (const song of song_count_lists){
        html += `
            <tr>
                <td>${song.name}</td>
                <td>${song.count}</td>
            </tr>
        `;
    }
    html += '</table>';

    const element = document.getElementById('count');
    element.innerHTML = html;


}

function text_to_html_singers(text_singers){
    let html = text_singers;
    for (const cv of cvs){
        if (cv.name === '愛美'){
            html = html.replace(/[^倉](愛美)/, html_cv(cv.name));
            html = html.replace(/^(愛美)/, html_cv(cv.name));
        } else {
            html = html.replace(cv.name, html_cv(cv.name));
        }
        
    }
    return html;
}
function set_list(cv_name){
    const element = document.getElementById('list');
    
    let html='<h2 class="bg-info text-light h4">歌唱履歴</h2>';
    html+='<table class="table table-striped">';

    for (const song of setori){
        if (is_singer_included(song.singers_text, cv_name)){

            
            let html_singers = text_to_html_singers(song.singers_text);

            html += `
            <tr>
                <td>
                    ${song.live}, ${song.part}
                </td>
                <td>
                    ${song.date}
                </td>
                <td style="font-size: large; font-weight: bold;">
                    ${song.name}
                </td>
                <td>
                    <span class="idol_name">
                        ${html_singers}
                    </span>
                </td>
            </tr>
        `;
        }

    }
    html+='</table>';

    element.innerHTML = html;

}

function html_cv(cv_name){
    return `<span style="color: ${color[cv_name]}">${cv_name}</span>`;
}

const data = `
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	1	Legend Girls!!		田所あずさ, 麻倉もも, 伊藤美来
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	2	素敵なキセキ		山崎はるか
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	3	オリジナル声になって		木戸衣吹
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	4	トキメキの音符になって		麻倉もも
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	5	Sentimental Venus		山崎はるか, 雨宮天, 木戸衣吹
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	6	透明なプロローグ		伊藤美来
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	7	Precious Grain		田所あずさ
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	8	ライアー・ルージュ		雨宮天
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	昼の部	2013/12/29	9	Thank You!		山崎はるか, 田所あずさ, 麻倉もも, 雨宮天, 伊藤美来, 木戸衣吹
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	1	PRETTY DREAMER		山崎はるか, 夏川椎菜, 渡部優衣
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	2	恋のLesson初級編		Machico
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	3	トキメキの音符になって		麻倉もも
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	4	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	5	Marionetteは眠らない		田所あずさ, 麻倉もも, Machico
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	6	Happy Darling		夏川椎菜
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	7	素敵なキセキ		山崎はるか
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	8	Precious Grain		田所あずさ
MILLION RADIO SPECIAL PARTY 01 〜2013年はThank You!〜 	夜の部	2013/12/29	9	Thank You!		山崎はるか, 田所あずさ, 麻倉もも, 夏川椎菜, Machico, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	1	Thank You!		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 愛美, 伊藤美来, 大関英里, 木戸衣吹, 諏訪彩花, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	2	PRETTY DREAMER		山崎はるか, 夏川椎菜, 諏訪彩花
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	3	素敵なキセキ		山崎はるか
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	4	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	5	Happy Darling		夏川椎菜
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	6	Legend Girls!!		麻倉もも, 愛美, 大関英里
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	7	Sentimental Venus		夏川椎菜, 伊藤美来, 木戸衣吹
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	8	恋のLesson初級編		Machico
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	9	スマイルいちばん		大関英里
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	10	フェスタ・イルミネーション		諏訪彩花
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	11	トキメキの音符になって		麻倉もも
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	12	Marionetteは眠らない		Machico, 麻倉もも, 愛美
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	13	GO MY WAY!!		山崎はるか, 諏訪彩花
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	14	キラメキラリ		夏川椎菜, 伊藤美来
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	15	きゅんっ！ヴァンパイアガール		麻倉もも, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	16	relations		山崎はるか, 愛美
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	17	自分REST@RT		Machico, 大関英里, 木戸衣吹
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	18	流星群		愛美
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	19	Blue Symphony		Machico, 伊藤美来, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	20	透明なプロローグ		伊藤美来
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	21	オリジナル声になって		木戸衣吹
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	22	瞳の中のシリウス		Machico, 諏訪彩花, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	23	ココロがかえる場所		山崎はるか, 麻倉もも, 大関英里, 木戸衣吹
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	24	Welcome!!		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 愛美, 伊藤美来, 大関英里, 木戸衣吹, 諏訪彩花, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	25	THE IDOLM@STER		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 愛美, 伊藤美来, 大関英里, 木戸衣吹, 諏訪彩花, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY1	2014/6/7	26	Thank You!		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 愛美, 伊藤美来, 大関英里, 木戸衣吹, 諏訪彩花, 渡部優衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	1	Thank You!		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 雨宮天, 上田麗奈, 郁原ゆう, 種田梨沙, 藤井ゆきよ, 村川梨衣, 伊藤美来
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	2	PRETTY DREAMER		山崎はるか, 夏川椎菜, 上田麗奈
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	3	素敵なキセキ		山崎はるか
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	4	Happy Darling		夏川椎菜
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	5	恋のLesson初級編		Machico
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	6	Legend Girls!!		麻倉もも, 郁原ゆう, 伊藤美来
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	7	Sentimental Venus		夏川椎菜, 郁原ゆう, 種田梨沙
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	8	アフタースクールパーリータイム		藤井ゆきよ
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	9	チョー↑元気Show☆アイドルch@ng!		村川梨衣
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	10	ココロ☆エクササイズ		上田麗奈
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	11	トキメキの音符になって		麻倉もも
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	12	Blue Symphony		Machico, 雨宮天, 種田梨沙, 藤井ゆきよ
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	13	GO MY WAY!!		山崎はるか, 種田梨沙
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	14	キラメキラリ		夏川椎菜, 伊藤美来
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	15	きゅんっ！ヴァンパイアガール		麻倉もも, 雨宮天
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	16	relations		山崎はるか, 藤井ゆきよ
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	17	自分REST@RT		Machico, 上田麗奈, 郁原ゆう
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	18	U・N・M・E・I ライブ		山崎はるか, 田所あずさ, 麻倉もも
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	19	Marionetteは眠らない		Machico, 麻倉もも, 雨宮天
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	20	透明なプロローグ		伊藤美来
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	21	朝焼けのクレッシェンド		種田梨沙
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	22	微笑み日和		郁原ゆう
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	23	ライアー・ルージュ		雨宮天
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	24	Precious Grain		田所あずさ
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	25	瞳の中のシリウス		Machico, 上田麗奈, 藤井ゆきよ
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	26	ココロがかえる場所		山崎はるか, 麻倉もも, 雨宮天
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	27	Welcome!!		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 雨宮天, 上田麗奈, 郁原ゆう, 種田梨沙, 藤井ゆきよ, 村川梨衣, 伊藤美来, 田所あずさ
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	28	THE IDOLM@STER		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 雨宮天, 上田麗奈, 郁原ゆう, 種田梨沙, 藤井ゆきよ, 村川梨衣, 伊藤美来, 田所あずさ
1stLIVE HAPPY☆PERFORM@NCE!!	DAY2	2014/6/8	29	Thank You!		山崎はるか, Machico, 麻倉もも, 夏川椎菜, 雨宮天, 上田麗奈, 郁原ゆう, 種田梨沙, 藤井ゆきよ, 村川梨衣, 伊藤美来, 田所あずさ
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	1	Thank You!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 木戸衣吹, 小岩井ことり, 駒形友梨, 近藤唯, 戸田めぐみ, 山口立花子
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	2	Growing Storm!		山崎はるか, Machico, 伊藤美来, 夏川椎菜
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	3	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	4	夢色トレイン		麻倉もも
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	5	Happy Darling		夏川椎菜
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	6	合言葉はスタートアップ！		藤井ゆきよ, 渡部優衣
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	7	Shooting Stars		田所あずさ, 麻倉もも, 雨宮天
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	8	Maria Trap		小岩井ことり
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	9	Be My Boy		山口立花子
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	10	ユニゾン☆ビート		戸田めぐみ
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	11	おまじない		木戸衣吹
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	12	君想いBirthday		駒形友梨
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	13	夕風のメロディー		近藤唯
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	14	THE IDOLM@STER		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 木戸衣吹, 小岩井ことり, 駒形友梨, 近藤唯, 戸田めぐみ, 山口立花子
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	15	PRETTY DREAMER		山崎はるか, 木戸衣吹, 駒形友梨
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	16	Sentimental Venus		夏川椎菜, 渡部優衣, 戸田めぐみ
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	17	Helloコンチェルト		田所あずさ, 伊藤美来, 小岩井ことり
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	18	Marionetteは眠らない		Machico, 麻倉もも, 近藤唯
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	19	Blue Symphony		雨宮天, 藤井ゆきよ, 山口立花子
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	20	恋のLesson初級編		Machico
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	21	アフタースクールパーリータイム		藤井ゆきよ
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	22	素敵なキセキ		山崎はるか
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	23	STANDING ALIVE		近藤唯, 山口立花子
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	24	星屑のシンフォニア		小岩井ことり, 駒形友梨
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	25	Birth of Color		木戸衣吹, 戸田めぐみ
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	26	透明なプロローグ		伊藤美来
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	27	絵本		雨宮天
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	28	Catch my dream		田所あずさ
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	29	Welcome!!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 木戸衣吹, 小岩井ことり, 駒形友梨, 近藤唯, 戸田めぐみ, 山口立花子
2ndLIVE ENJOY H@RMONY!!	DAY1	2015/4/4	30	Thank You!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 木戸衣吹, 小岩井ことり, 駒形友梨, 近藤唯, 戸田めぐみ, 山口立花子
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	1	Thank You!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 上田麗奈, 大関英里, 末柄里恵, 髙橋ミナミ, 村川梨衣
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	2	Growing Storm!		山崎はるか, Machico, 伊藤美来, 夏川椎菜
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	3	Super Lover		渡部優衣
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	4	VIVID イマジネーション		夏川椎菜
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	5	トキメキの音符になって		麻倉もも
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	6	ジレるハートに火をつけて		藤井ゆきよ, 上田麗奈
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	7	Shooting Stars		田所あずさ, 麻倉もも, 雨宮天
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	8	Up!10sion♪Pleeeeeeeeease!		村川梨衣
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	9	恋愛ロードランナー		上田麗奈
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	10	SUPER SIZE LOVE!!		大関英里
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	11	プラリネ		愛美
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	12	dear...		髙橋ミナミ
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	13	オレンジの空の下		末柄里恵
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	14	THE IDOLM@STER		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 上田麗奈, 大関英里, 末柄里恵, 髙橋ミナミ, 村川梨衣
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	15	PRETTY DREAMER		山崎はるか, 髙橋ミナミ, 村川梨衣
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	16	Sentimental Venus		夏川椎菜, 渡部優衣, 末柄里恵
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	17	Helloコンチェルト		田所あずさ, 伊藤美来, 大関英里
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	18	Marionetteは眠らない		Machico, 麻倉もも, 上田麗奈
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	19	Blue Symphony		雨宮天, 藤井ゆきよ, 愛美
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	20	Believe my change!		Machico
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	21	フローズン・ワード		藤井ゆきよ
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	22	ライアー・ルージュ		雨宮天
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	23	HOME, SWEET FRIENDSHIP		渡部優衣, 村川梨衣
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	24	Eternal Harmony		愛美, 末柄里恵
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	25	ドリームトラベラー		大関英里, 髙橋ミナミ
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	26	空想文学少女		伊藤美来
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	27	Precious Grain		田所あずさ
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	28	未来飛行		山崎はるか
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	29	Welcome!!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 上田麗奈, 大関英里, 末柄里恵, 髙橋ミナミ, 村川梨衣
2ndLIVE ENJOY H@RMONY!!	DAY2	2015/4/5	30	Thank You!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 上田麗奈, 大関英里, 末柄里恵, 髙橋ミナミ, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	1	Dreaming!		山崎はるか, Machico, 愛美, 稲川英里, 木戸衣吹, 桐谷蝶々, 諏訪彩花, 髙橋ミナミ, 藤井ゆきよ, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	2	エスケープ		愛美, 藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	3	カーニヴァル・ジャパネスク		諏訪彩花
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	4	BOUNCING♪ SMILE!		稲川英里
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	5	デコレーション・ドリ〜ミンッ♪		渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	6	Smiling Crescent		稲川英里, 桐谷蝶々
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	7	Eternal Spiral		山崎はるか, 木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	8	Bigバルーン◎		髙橋ミナミ, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	9	Growing Storm!		山崎はるか, Machico
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	10	初恋バタフライ		桐谷蝶々
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	11	おまじない		木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	12	START!!		山崎はるか, 諏訪彩花
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	13	I Want		Machico, 藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	14	ゲンキトリッパー		稲川英里, 木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	15	99 Nights		桐谷蝶々, 髙橋ミナミ
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	16	オーバーマスター		愛美, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	17	Decided		諏訪彩花, 髙橋ミナミ
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	18	素敵なキセキ		山崎はるか
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	19	アフタースクールパーリータイム		藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	20	瞳の中のシリウス		愛美, 木戸衣吹, 諏訪彩花
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	21	ジレるハートに火をつけて		稲川英里, 藤井ゆきよ, 桐谷蝶々
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	22	深層マーメイド		Machico, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	23	水中キャンディ		髙橋ミナミ
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	24	流星群		愛美
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	25	Believe my change!		Machico
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	26	STANDING ALIVE		Machico, 木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	27	Welcome!!		山崎はるか, Machico, 愛美, 稲川英里, 木戸衣吹, 桐谷蝶々, 諏訪彩花, 髙橋ミナミ, 藤井ゆきよ, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	名古屋公演	2016/1/31	28	Thank You!		山崎はるか, Machico, 愛美, 稲川英里, 木戸衣吹, 桐谷蝶々, 諏訪彩花, 髙橋ミナミ, 藤井ゆきよ, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	1	Dreaming!		Machico, 麻倉もも, 雨宮天, 伊藤美来, 郁原ゆう, 近藤唯, 夏川椎菜, 原嶋あかり, 村川梨衣, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	2	成長Chu→LOVER!!		伊藤美来, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	3	チョー↑元気Show☆アイドルch@ng!		村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	4	グッデイ・サンシャイン！		原嶋あかり
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	5	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	6	little trip around the world		麻倉もも, 郁原ゆう
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	7	G♡F		近藤唯, 原嶋あかり
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	8	Sentimental Venus		郁原ゆう, 夏川椎菜, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	9	STANDING ALIVE		雨宮天, 近藤唯
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	10	夢色トレイン		麻倉もも
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	11	VIVID イマジネーション		夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	12	shiny smile		Machico, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	13	DREAM		郁原ゆう, 近藤唯
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	14	いっぱいいっぱい		原嶋あかり, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	15	バレンタイン		麻倉もも, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	16	Vault That Borderline!		雨宮天, 伊藤美来
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	17	夜に輝く星座のように		村川梨衣, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	18	恋のLesson初級編		Machico
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	19	ライアー・ルージュ		雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	20	Legend Girls!!		麻倉もも, 伊藤美来
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	21	Helloコンチェルト		Machico, 原嶋あかり, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	22	piece of cake		Machico, 雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	23	ちいさな恋の足音		近藤唯
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	24	君だけの欠片		郁原ゆう
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	25	空想文学少女		伊藤美来
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	26	カワラナイモノ		伊藤美来, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	27	Welcome!!		Machico, 麻倉もも, 雨宮天, 伊藤美来, 郁原ゆう, 近藤唯, 夏川椎菜, 原嶋あかり, 村川梨衣, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	仙台公演	2016/2/7	28	Thank You!		Machico, 麻倉もも, 雨宮天, 伊藤美来, 郁原ゆう, 近藤唯, 夏川椎菜, 原嶋あかり, 村川梨衣, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	1	Dreaming!		山崎はるか, 田所あずさ, Machico, 愛美, 麻倉もも, 大関英里, 夏川椎菜, 藤井ゆきよ, 山口立花子, 渡部優衣, 上田麗奈, 角元明日香, 駒形友梨, 野村香菜子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	2	エスケープ		愛美, 藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	3	恋愛ロードランナー		上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	4	スマイルいちばん		大関英里
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	5	Happy Darling		夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	6	Sentimental Venus		山崎はるか, Machico, 愛美, 野村香菜子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	7	PRETTY DREAMER		夏川椎菜, 山口立花子, 渡部優衣, 上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	8	未来飛行		山崎はるか
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	9	君想いBirthday		駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	10	成長Chu→LOVER!!		山崎はるか, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	11	夜に輝く星座のように		渡部優衣, 上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	12	トキメキの音符になって		麻倉もも
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	13	アフタースクールパーリータイム		藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	14	おとなのはじまり		山崎はるか, 麻倉もも, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	15	自転車		田所あずさ, 愛美, 角元明日香
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	16	MEGARE!		大関英里, 藤井ゆきよ, 上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	17	風花		Machico, 駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	18	またね		山口立花子, 渡部優衣, 野村香菜子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	19	Smiling Crescent		麻倉もも, 角元明日香
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	20	たしかな足跡		Machico, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	21	ドリームトラベラー		大関英里, 藤井ゆきよ, 角元明日香
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	22	Blue Symphony		田所あずさ, 麻倉もも, 駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	23	想いはCarnaval		角元明日香
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	24	恋心マスカレード		野村香菜子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	25	Be My Boy		山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	26	プラリネ		愛美
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	27	Persona Voice		田所あずさ, 野村香菜子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	28	Believe my change!		Machico
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	29	Precious Grain		田所あずさ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	30	Melody in scape		大関英里, 駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	31	Super Lover		渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	32	ココロがかえる場所		藤井ゆきよ, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	33	Welcome!!		山崎はるか, 田所あずさ, Machico, 愛美, 麻倉もも, 大関英里, 夏川椎菜, 藤井ゆきよ, 山口立花子, 渡部優衣, 上田麗奈, 角元明日香, 駒形友梨, 野村香菜子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演1日目	2016/3/12	34	Thank You!		山崎はるか, 田所あずさ, Machico, 愛美, 麻倉もも, 大関英里, 夏川椎菜, 藤井ゆきよ, 山口立花子, 渡部優衣, 上田麗奈, 角元明日香, 駒形友梨, 野村香菜子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	1	Dreaming!		山崎はるか, 田所あずさ, Machico, 愛美, 麻倉もも, 大関英里, 夏川椎菜, 藤井ゆきよ, 山口立花子, 渡部優衣, 小笠原早紀, 末柄里恵, 戸田めぐみ, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	2	エスケープ		愛美, 藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	3	Up!10sion♪Pleeeeeeeeease!		村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	4	プリティ〜〜〜ッ→ニャンニャンッ！		小笠原早紀
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	5	VIVID イマジネーション		夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	6	Sentimental Venus		山崎はるか, Machico, 愛美, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	7	PRETTY DREAMER		夏川椎菜, 山口立花子, 渡部優衣, 小笠原早紀
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	8	素敵なキセキ		山崎はるか
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	9	SUPER SIZE LOVE!!		大関英里
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	10	成長Chu→LOVER!!		山崎はるか, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	11	秘密のメモリーズ		田所あずさ, 末柄里恵
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	12	夢色トレイン		麻倉もも
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	13	恋のLesson初級編		Machico
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	14	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	15	おとなのはじまり		山崎はるか, 麻倉もも, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	16	自転車		田所あずさ, 愛美, 戸田めぐみ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	17	MEGARE!		大関英里, 藤井ゆきよ, 小笠原早紀
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	18	風花		Machico, 末柄里恵
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	19	またね		山口立花子, 渡部優衣, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	20	Smiling Crescent		麻倉もも, 小笠原早紀
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	21	夜に輝く星座のように		渡部優衣, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	22	WHY?		山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	23	ドリームトラベラー		大関英里, 藤井ゆきよ, 戸田めぐみ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	24	たしかな足跡		Machico, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	25	Blue Symphony		田所あずさ, 麻倉もも, 末柄里恵
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	26	Get My Shinin'		戸田めぐみ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	27	bitter sweet		末柄里恵
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	28	Catch my dream		田所あずさ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	29	流星群		愛美
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	30	Melody in scape		大関英里, 戸田めぐみ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	31	フローズン・ワード		藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	32	ココロがかえる場所		藤井ゆきよ, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	33	Welcome!!		山崎はるか, 田所あずさ, Machico, 愛美, 麻倉もも, 大関英里, 夏川椎菜, 藤井ゆきよ, 山口立花子, 渡部優衣, 小笠原早紀, 末柄里恵, 戸田めぐみ, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	大阪公演2日目	2016/3/13	34	Thank You!		山崎はるか, 田所あずさ, Machico, 愛美, 麻倉もも, 大関英里, 夏川椎菜, 藤井ゆきよ, 山口立花子, 渡部優衣, 小笠原早紀, 末柄里恵, 戸田めぐみ, 村川梨衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	1	Dreaming!		田所あずさ, 麻倉もも, 雨宮天, 伊藤美来, 上田麗奈, 木戸衣吹, 種田梨沙, 田村奈央, 中村温姫, 平山笑美
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	2	Understand? Understand!		上田麗奈, 種田梨沙
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	3	サマ☆トリ 〜Summer trip〜		平山笑美
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	4	ココロ☆エクササイズ		上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	5	おまじない		木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	6	fruity love		伊藤美来, 中村温姫
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	7	piece of cake		雨宮天, 平山笑美
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	8	"Your" HOME TOWN		麻倉もも, 田村奈央
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	9	Eternal Spiral		田所あずさ, 木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	10	あのね、聞いてほしいことがあるんだ		田村奈央
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	11	ジレるハートに火をつけて		上田麗奈, 種田梨沙
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	12	夢色トレイン		麻倉もも
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	13	乙女よ大志を抱け！！		伊藤美来, 木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	14	KisS		麻倉もも, 上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	15	inferno		田所あずさ, 雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	16	First Stage		中村温姫, 平山笑美
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	17	チクタク		種田梨沙, 田村奈央
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	18	Fu-Wa-Du-Wa		木戸衣吹, 中村温姫
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	19	透明なプロローグ		伊藤美来
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	20	STEREOPHONIC ISOTONIC		中村温姫
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	21	Helloコンチェルト		伊藤美来, 田村奈央
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	22	Shooting Stars		田所あずさ, 麻倉もも, 雨宮天, 平山笑美
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	23	Precious Grain		田所あずさ
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	24	ホントウノワタシ		種田梨沙
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	25	絵本		雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	26	星屑のシンフォニア		麻倉もも, 雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	27	Welcome!!		田所あずさ, 麻倉もも, 雨宮天, 伊藤美来, 上田麗奈, 木戸衣吹, 種田梨沙, 田村奈央, 中村温姫, 平山笑美
3rdLIVE TOUR BELIEVE MY DRE@M!!	福岡公演	2016/4/3	28	Thank You!		田所あずさ, 麻倉もも, 雨宮天, 伊藤美来, 上田麗奈, 木戸衣吹, 種田梨沙, 田村奈央, 中村温姫, 平山笑美
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	1	Dreaming!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 阿部里果, 小岩井ことり, 斉藤佑圭, 浜崎奈々, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	2	Cut. Cut. Cut.		阿部里果, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	3	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	4	ビギナーズ☆ストライク		斉藤佑圭
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	5	成長Chu→LOVER!!		伊藤美来, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	6	トキメキの音符になって		麻倉もも
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	7	アフタースクールパーリータイム		藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	8	Legend Girls!!		田所あずさ, 麻倉もも, 小岩井ことり
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	9	Growing Storm!		山崎はるか, Machico, 伊藤美来, 夏川椎菜, 阿部里果
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	10	フェスタ・イルミネーション		諏訪彩花
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	11	VIVID イマジネーション		夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	12	...In The Name Of。 ...LOVE?		阿部里果
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	13	piece of cake		田所あずさ, 雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	14	エスケープ		藤井ゆきよ, 愛美
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	15	求ム VS マイ・フューチャー		浜崎奈々
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	16	素敵なキセキ		山崎はるか
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	17	キラメキ進行形		山崎はるか, 伊藤美来, 浜崎奈々
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	18	待ち受けプリンス		諏訪彩花, 渡部優衣, 愛美
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	19	Fate of the World		田所あずさ, 小岩井ことり
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	20	SMOKY THRILL		夏川椎菜, 藤井ゆきよ, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	21	マリオネットの心		Machico, 斉藤佑圭
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	22	虹色ミラクル		麻倉もも, 雨宮天, 阿部里果
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	23	THE IDOLM@STER		全員
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	24	HELLO, YOUR ANGEL♪		諏訪彩花, 小岩井ことり
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	25	HOME, SWEET FRIENDSHIP		渡部優衣, 浜崎奈々, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	26	Smiling Crescent		山崎はるか, 麻倉もも
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	27	Eternal Harmony		諏訪彩花, 愛美
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	28	Shooting Stars		雨宮天, 藤井ゆきよ, 斉藤佑圭
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	29	深層マーメイド		Machico, 渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	30	Dreamscape		斉藤佑圭, 浜崎奈々
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	31	MY STYLE! OUR STYLE!!!!		渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	32	プラリネ		愛美
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	33	アイル		Machico, 愛美, 阿部里果
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	34	ライアー・ルージュ		雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	35	鳥籠スクリプチュア		小岩井ことり
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	36	空想文学少女		伊藤美来
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	37	Precious Grain		田所あずさ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	38	合言葉はスタートアップ！		山崎はるか, 田所あずさ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	39	Welcome!!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 阿部里果, 小岩井ことり, 斉藤佑圭, 浜崎奈々, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	40	Thank You!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 阿部里果, 小岩井ことり, 斉藤佑圭, 浜崎奈々, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演1日目	2016/4/16	41	Dreaming!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 愛美, 阿部里果, 小岩井ことり, 斉藤佑圭, 浜崎奈々, 渡部恵子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	1	Dreaming!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 上田麗奈, 大関英里, 木戸衣吹, 駒形友梨, 髙橋ミナミ, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	2	成長Chu→LOVER!!		伊藤美来, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	3	カーニヴァル・ジャパネスク		諏訪彩花
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	4	Understand? Understand!		雨宮天, 上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	5	WHY?		山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	6	Birth of Color		Machico, 雨宮天, 夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	7	ジレるハートに火をつけて		山崎はるか, 渡部優衣, 木戸衣吹, 髙橋ミナミ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	8	ココロ☆エクササイズ		上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	9	SUPER SIZE LOVE!!		大関英里
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	10	Smiling Crescent		麻倉もも, 藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	11	たしかな足跡		山崎はるか, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	12	vivid color		駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	13	dear...		髙橋ミナミ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	14	キラメキ進行形		山崎はるか, 伊藤美来, 大関英里
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	15	待ち受けプリンス		諏訪彩花, 渡部優衣, 上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	16	Fate of the World		田所あずさ, 髙橋ミナミ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	17	SMOKY THRILL		夏川椎菜, 藤井ゆきよ, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	18	マリオネットの心		Machico, 駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	19	虹色ミラクル		麻倉もも, 雨宮天, 木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	20	THE IDOLM@STER		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 上田麗奈, 大関英里, 木戸衣吹, 駒形友梨, 髙橋ミナミ, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	21	Sentimental Venus		藤井ゆきよ, 大関英里, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	22	夜に輝く星座のように		渡部優衣, 木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	23	Melody in scape		大関英里, 駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	24	瞳の中のシリウス		伊藤美来, 諏訪彩花, 上田麗奈
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	25	カワラナイモノ		田所あずさ, 麻倉もも, 駒形友梨
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	26	Decided		諏訪彩花, 髙橋ミナミ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	27	アライブファクター		田所あずさ, Machico
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	28	夢色トレイン		麻倉もも
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	29	Happy Darling		夏川椎菜
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	30	Super Lover		渡部優衣
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	31	フローズン・ワード		藤井ゆきよ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	32	透明なプロローグ		伊藤美来
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	33	オリジナル声になって		木戸衣吹
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	34	絵本		雨宮天
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	35	Believe my change!		Machico
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	36	Catch my dream		田所あずさ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	37	未来飛行		山崎はるか
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	38	ハルカナミライ		山崎はるか, 田所あずさ
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	39	Welcome!!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 上田麗奈, 大関英里, 木戸衣吹, 駒形友梨, 髙橋ミナミ, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	40	Thank You!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 上田麗奈, 大関英里, 木戸衣吹, 駒形友梨, 髙橋ミナミ, 山口立花子
3rdLIVE TOUR BELIEVE MY DRE@M!!	幕張公演2日目	2016/4/17	41	Dreaming!		山崎はるか, 田所あずさ, Machico, 麻倉もも, 雨宮天, 伊藤美来, 諏訪彩花, 夏川椎菜, 藤井ゆきよ, 渡部優衣, 上田麗奈, 大関英里, 木戸衣吹, 駒形友梨, 髙橋ミナミ, 山口立花子
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	1	Thank You!		Machico, 大関英里, 角元明日香, 郁原ゆう, 木戸衣吹, 田村奈央, 中村温姫, 夏川椎菜, 浜崎奈々, 原嶋あかり, 山口立花子, 渡部優衣
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	2	サンリズム・オーケストラ♪		Machico, 大関英里, 角元明日香, 郁原ゆう, 木戸衣吹, 田村奈央, 中村温姫, 夏川椎菜, 浜崎奈々, 原嶋あかり, 山口立花子, 渡部優衣
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	3	おまじない		木戸衣吹
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	4	Happy Darling		夏川椎菜
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	5	WHY?		山口立花子
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	6	ゲキテキ！ムテキ！恋したい！		角元明日香, 原嶋あかり, 中村温姫
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	7	マイペース☆マイウェイ		浜崎奈々
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	8	SUPER SIZE LOVE!!		大関英里
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	9	恋のLesson初級編		Machico
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	10	ランニング・ハイッ		郁原ゆう, 田村奈央, 渡部優衣
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	11	アニマル☆ステイション！		原嶋あかり
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	12	IMPRESSION→LOCOMOTION!		中村温姫
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	13	ファンタジスタ・カーニバル		角元明日香
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	14	NO CURRY NO LIFE		夏川椎菜, 山口立花子, 木戸衣吹
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	15	微笑み日和		郁原ゆう
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	16	りんごのマーチ		田村奈央
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	17	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	18	Bonnes! Bonnes!! Vacances!!!		Machico, 大関英里, 浜崎奈々
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	19	創造は始まりの風を連れて		伊藤美来, 小岩井ことり, 麻倉もも, 村川梨衣, 中村温姫
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	20	Emergence Vibe		角元明日香, 山口立花子
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	21	fruity love		中村温姫, 原嶋あかり
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	22	Eternal Harmony		大関英里, 郁原ゆう, 木戸衣吹, 夏川椎菜
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	23	HOME, SWEET FRIENDSHIP		Machico, 田村奈央, 浜崎奈々, 渡部優衣
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	24	Growing Storm!		山崎はるか, Machico, 阿部里果, 伊藤美来, 夏川椎菜
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	25	DIAMOND DAYS		Machico, 大関英里, 角元明日香, 郁原ゆう, 木戸衣吹, 田村奈央, 中村温姫, 夏川椎菜, 浜崎奈々, 原嶋あかり, 山口立花子, 渡部優衣
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	26	Dreaming!		Machico, 大関英里, 角元明日香, 郁原ゆう, 木戸衣吹, 田村奈央, 中村温姫, 夏川椎菜, 浜崎奈々, 原嶋あかり, 山口立花子, 渡部優衣
4thLIVE TH@NK YOU for SMILE!!	DAY1 Sunshine Theater	2017/3/10	27	Thank You!		Machico, 大関英里, 角元明日香, 郁原ゆう, 木戸衣吹, 田村奈央, 中村温姫, 夏川椎菜, 浜崎奈々, 原嶋あかり, 山口立花子, 渡部優衣, 伊藤美来, 小岩井ことり, 麻倉もも, 村川梨衣, 山崎はるか, 阿部里果
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	1	Thank You!		田所あずさ, 愛美, 阿部里果, 伊藤美来, 小岩井ことり, 駒形友梨, 近藤唯, 斉藤佑圭, 戸田めぐみ, 野村香菜子, 平山笑美, 藤井ゆきよ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	2	brave HARMONY		田所あずさ, 愛美, 阿部里果, 伊藤美来, 小岩井ことり, 駒形友梨, 近藤唯, 斉藤佑圭, 戸田めぐみ, 野村香菜子, 平山笑美, 藤井ゆきよ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	3	恋の音色ライン		野村香菜子
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	4	夕風のメロディー		近藤唯
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	5	Maria Trap		小岩井ことり
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	6	Raise the FLAG		藤井ゆきよ, 戸田めぐみ, 阿部里果
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	7	Day After "Yesterday"		斉藤佑圭
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	8	透明なプロローグ		伊藤美来
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	9	Precious Grain		田所あずさ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	10	待ちぼうけのLacrima		平山笑美, 愛美, 駒形友梨
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	11	フローズン・ワード		藤井ゆきよ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	12	Get My Shinin'		戸田めぐみ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	13	POKER POKER		阿部里果
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	14	P.S I Love You		近藤唯, 小岩井ことり, 野村香菜子
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	15	流星群		愛美
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	16	vivid color		駒形友梨
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	17	FIND YOUR WIND!		平山笑美
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	18	プリムラ		斉藤佑圭, 伊藤美来, 田所あずさ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	19	赤い世界が消える頃		木戸衣吹, 大関英里, 近藤唯, 阿部里果, 平山笑美
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	20	Beat the World!!		戸田めぐみ, 藤井ゆきよ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	21	Marionetteは眠らない		愛美, 平山笑美
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	22	Blue Symphony		田所あずさ, 阿部里果, 伊藤美来, 近藤唯
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	23	星屑のシンフォニア		小岩井ことり, 駒形友梨, 斉藤佑圭, 野村香菜子
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	24	Flooding		田所あずさ, 平山笑美, 雨宮天, 小笠原早紀, 麻倉もも
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	25	DIAMOND DAYS		田所あずさ, 愛美, 阿部里果, 伊藤美来, 小岩井ことり, 駒形友梨, 近藤唯, 斉藤佑圭, 戸田めぐみ, 野村香菜子, 平山笑美, 藤井ゆきよ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	26	Dreaming!		田所あずさ, 愛美, 阿部里果, 伊藤美来, 小岩井ことり, 駒形友梨, 近藤唯, 斉藤佑圭, 戸田めぐみ, 野村香菜子, 平山笑美, 藤井ゆきよ
4thLIVE TH@NK YOU for SMILE!!	DAY2 BlueMoon Theater	2017/3/11	27	Thank You!		田所あずさ, 愛美, 阿部里果, 伊藤美来, 小岩井ことり, 駒形友梨, 近藤唯, 斉藤佑圭, 戸田めぐみ, 野村香菜子, 平山笑美, 藤井ゆきよ, 木戸衣吹, 大関英里, 雨宮天, 小笠原早紀, 麻倉もも
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	1	Thank You!		山崎はるか, 麻倉もも, 雨宮天, 稲川英里, 上田麗奈, 小笠原早紀, 桐谷蝶々, 末柄里恵, 諏訪彩花, 髙橋ミナミ, 村川梨衣, 渡部恵子
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	2	Starry Melody		山崎はるか, 麻倉もも, 雨宮天, 稲川英里, 上田麗奈, 小笠原早紀, 桐谷蝶々, 末柄里恵, 諏訪彩花, 髙橋ミナミ, 村川梨衣, 渡部恵子
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	3	Heart♡・デイズ・Night☆		小笠原早紀
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	4	ホップ♪ステップ♪レインボウ♪		稲川英里
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	5	トキメキの音符になって		麻倉もも
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	6	リフレインキス		雨宮天, 上田麗奈, 村川梨衣
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	7	フェスタ・イルミネーション		諏訪彩花
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	8	素敵なキセキ		山崎はるか
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	9	ハッピ〜 エフェクト！		桐谷蝶々
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	10	永遠の花		渡部恵子, 末柄里恵, 髙橋ミナミ
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	11	デコレーション・ドリ〜ミンッ♪		渡部恵子
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	12	dear...		髙橋ミナミ
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	13	オレンジの空の下		末柄里恵
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	14	Sweet Sweet Soul		稲川英里, 小笠原早紀, 麻倉もも
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	15	恋愛ロードランナー		上田麗奈
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	16	Up!10sion♪Pleeeeeeeeease!		村川梨衣
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	17	ライアー・ルージュ		雨宮天
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	18	メメント？モメント♪ルルルルル☆		山崎はるか, 諏訪彩花, 桐谷蝶々
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	19	俠気乱舞		愛美, 渡部恵子, 稲川英里, 田村奈央, 浜崎奈々
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	20	ジャングル☆パーティー		稲川英里, 小笠原早紀
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	21	little trip around the world		麻倉もも, 渡部恵子
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	22	PRETTY DREAMER		山崎はるか, 末柄里恵, 髙橋ミナミ, 村川梨衣
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	23	瞳の中のシリウス		雨宮天, 上田麗奈, 桐谷蝶々, 諏訪彩花
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	24	ジレるハートに火をつけて		稲川英里, 上田麗奈, 桐谷蝶々, 藤井ゆきよ
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	25	君との明日を願うから		山崎はるか, 田所あずさ, Machico
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	26	Brand New Theater!		山崎はるか, 麻倉もも, 雨宮天, 稲川英里, 上田麗奈, 小笠原早紀, 桐谷蝶々, 末柄里恵, 諏訪彩花, 髙橋ミナミ, 村川梨衣, 渡部恵子
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	27	Dreaming!		山崎はるか, 麻倉もも, 雨宮天, 稲川英里, 上田麗奈, 小笠原早紀, 桐谷蝶々, 末柄里恵, 諏訪彩花, 髙橋ミナミ, 村川梨衣, 渡部恵子
4thLIVE TH@NK YOU for SMILE!!	DAY3 Starlight Theater	2017/3/12	28	Thank You!		山崎はるか, 麻倉もも, 雨宮天, 稲川英里, 上田麗奈, 小笠原早紀, 桐谷蝶々, 末柄里恵, 諏訪彩花, 髙橋ミナミ, 村川梨衣, 渡部恵子, 田所あずさ, 愛美, 阿部里果, 伊藤美来, 小岩井ことり, 駒形友梨, 近藤唯, 斉藤佑圭, 戸田めぐみ, 野村香菜子, 平山笑美, 藤井ゆきよ, Machico, 大関英里, 角元明日香, 郁原ゆう, 木戸衣吹, 田村奈央, 中村温姫, 夏川椎菜, 浜崎奈々, 原嶋あかり, 山口立花子, 渡部優衣, 田中琴葉
First Time in TAIWAN 	DAY1	2017/4/22	1	READY!!		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	2	ハッピー☆ラッキー☆ジェットマシーン		中村繪里子, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	3	BOUNCING♪ SMILE!		沼倉愛美, 稲川英里
First Time in TAIWAN 	DAY1	2017/4/22	4	恋のLesson初級編		下田麻美, Machico
First Time in TAIWAN 	DAY1	2017/4/22	5	トキメキの音符になって		浅倉杏美, 麻倉もも
First Time in TAIWAN 	DAY1	2017/4/22	6	プラリネ		愛美
First Time in TAIWAN 	DAY1	2017/4/22	7	bitter sweet		末柄里恵
First Time in TAIWAN 	DAY1	2017/4/22	8	恋心マスカレード		今井麻美, 野村香菜子
First Time in TAIWAN 	DAY1	2017/4/22	9	透明なプロローグ		今井麻美, 原由実
First Time in TAIWAN 	DAY1	2017/4/22	10	素敵なキセキ		山崎はるか
First Time in TAIWAN 	DAY1	2017/4/22	11	DIAMOND DAYS		山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	12	乙女よ大志を抱け！！		中村繪里子, 麻倉もも
First Time in TAIWAN 	DAY1	2017/4/22	13	ALRIGHT*		浅倉杏美, 稲川英里, 愛美
First Time in TAIWAN 	DAY1	2017/4/22	14	スタ→トスタ→		下田麻美, 山崎はるか, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	15	Pon De Beach		沼倉愛美, Machico
First Time in TAIWAN 	DAY1	2017/4/22	16	風花		原由実, 末柄里恵, 野村香菜子
First Time in TAIWAN 	DAY1	2017/4/22	17	蒼い鳥		今井麻美
First Time in TAIWAN 	DAY1	2017/4/22	18	自分REST@RT		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美
First Time in TAIWAN 	DAY1	2017/4/22	19	GO MY WAY!!		中村繪里子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	20	ジャングル☆パーティー		下田麻美, 稲川英里
First Time in TAIWAN 	DAY1	2017/4/22	21	Persona Voice		浅倉杏美, 野村香菜子
First Time in TAIWAN 	DAY1	2017/4/22	22	Eternal Harmony		今井麻美, 愛美, 末柄里恵
First Time in TAIWAN 	DAY1	2017/4/22	23	深層マーメイド		沼倉愛美, Machico
First Time in TAIWAN 	DAY1	2017/4/22	24	秘密のメモリーズ		原由実, 末柄里恵
First Time in TAIWAN 	DAY1	2017/4/22	25	ハルカナミライ		中村繪里子, 山崎はるか
First Time in TAIWAN 	DAY1	2017/4/22	26	Dreaming!		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	27	M@STERPIECE		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	28	THE IDOLM@STER		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY1	2017/4/22	29	The world is all one !!		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	1	READY!!		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	2	ハッピー☆ラッキー☆ジェットマシーン		中村繪里子, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	3	BOUNCING♪ SMILE!		沼倉愛美, 稲川英里
First Time in TAIWAN 	DAY2	2017/4/23	4	恋のLesson初級編		下田麻美, Machico
First Time in TAIWAN 	DAY2	2017/4/23	5	トキメキの音符になって		浅倉杏美, 麻倉もも
First Time in TAIWAN 	DAY2	2017/4/23	6	プラリネ		愛美
First Time in TAIWAN 	DAY2	2017/4/23	7	bitter sweet		末柄里恵
First Time in TAIWAN 	DAY2	2017/4/23	8	恋心マスカレード		今井麻美, 野村香菜子
First Time in TAIWAN 	DAY2	2017/4/23	9	透明なプロローグ		今井麻美, 原由実
First Time in TAIWAN 	DAY2	2017/4/23	10	素敵なキセキ		山崎はるか
First Time in TAIWAN 	DAY2	2017/4/23	11	Welcome!!		山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	12	乙女よ大志を抱け！！		中村繪里子, 麻倉もも
First Time in TAIWAN 	DAY2	2017/4/23	13	ALRIGHT*		浅倉杏美, 稲川英里, 愛美
First Time in TAIWAN 	DAY2	2017/4/23	14	スタ→トスタ→		下田麻美, 山崎はるか, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	15	Pon De Beach		沼倉愛美, Machico
First Time in TAIWAN 	DAY2	2017/4/23	16	風花		原由実, 末柄里恵, 野村香菜子
First Time in TAIWAN 	DAY2	2017/4/23	17	蒼い鳥		今井麻美
First Time in TAIWAN 	DAY2	2017/4/23	18	Happy!		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美
First Time in TAIWAN 	DAY2	2017/4/23	19	GO MY WAY!!		中村繪里子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	20	ジャングル☆パーティー		下田麻美, 稲川英里
First Time in TAIWAN 	DAY2	2017/4/23	21	Persona Voice		浅倉杏美, 野村香菜子
First Time in TAIWAN 	DAY2	2017/4/23	22	Eternal Harmony		今井麻美, 愛美, 末柄里恵
First Time in TAIWAN 	DAY2	2017/4/23	23	深層マーメイド		沼倉愛美, Machico
First Time in TAIWAN 	DAY2	2017/4/23	24	秘密のメモリーズ		原由実, 末柄里恵
First Time in TAIWAN 	DAY2	2017/4/23	25	ハルカナミライ		中村繪里子, 山崎はるか
First Time in TAIWAN 	DAY2	2017/4/23	26	Dreaming!		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	27	M@STERPIECE		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	28	THE IDOLM@STER		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
First Time in TAIWAN 	DAY2	2017/4/23	29	The world is all one !!		中村繪里子, 今井麻美, 浅倉杏美, 下田麻美, 原由実, 沼倉愛美, 山崎はるか, Machico, 稲川英里, 愛美, 末柄里恵, 野村香菜子, 麻倉もも, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	1	Welcome!!		中村繪里子, 沼倉愛美, 平田宏美, 原由実, 仁後真耶子, たかはし智秋, 山崎はるか, 郁原ゆう, 平山笑美, 上田麗奈, 大関英里, 近藤唯, 愛美, 南早紀, 原嶋あかり, 伊藤美来, 野村香菜子, 小笠原早紀, 麻倉もも, 戸田めぐみ, 桐谷蝶々, 夏川椎菜, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	2	神SUMMER!!		平田宏美, たかはし智秋, 上田麗奈, 近藤唯, 戸田めぐみ
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	3	アニマル☆ステイション！		沼倉愛美, 原嶋あかり, 小笠原早紀
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	4	きゅんっ！ヴァンパイアガール		近藤唯, 伊藤美来, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	5	スタ→トスタ→		伊藤美来, 夏川椎菜
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	6	HOME, SWEET FRIENDSHIP		中村繪里子, 原由実, たかはし智秋, 平山笑美, 大関英里, 近藤唯, 原嶋あかり, 野村香菜子, 戸田めぐみ, 桐谷蝶々, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	7	I Want		中村繪里子, 愛美
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	8	黎明スターライン		野村香菜子, 小笠原早紀, 麻倉もも
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	9	スマイル体操		仁後真耶子, 平山笑美, 上田麗奈
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	10	愛 LIKE ハンバーガー		原由実, 大関英里, 野村香菜子, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	11	PRETTY DREAMER		沼倉愛美, 平田宏美, 仁後真耶子, 山崎はるか, 郁原ゆう, 上田麗奈, 愛美, 南早紀, 伊藤美来, 小笠原早紀, 麻倉もも, 夏川椎菜
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	12	I'm so free!		たかはし智秋, 平山笑美, 桐谷蝶々
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	13	shiny smile		沼倉愛美, 南早紀
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	14	KisS		原由実, 麻倉もも
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	15	DIAMOND DAYS		山崎はるか, 郁原ゆう, 平山笑美, 上田麗奈, 大関英里, 近藤唯, 愛美, 南早紀, 原嶋あかり, 伊藤美来, 野村香菜子, 小笠原早紀, 麻倉もも, 戸田めぐみ, 桐谷蝶々, 夏川椎菜, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	16	ToP!!!!!!!!!!!!!		中村繪里子, 沼倉愛美, 平田宏美, 原由実, 仁後真耶子, たかはし智秋
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	17	キラメキラリ		仁後真耶子, 原嶋あかり / ギターソロ: 愛美
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	18	アマテラス		原由実, たかはし智秋, 郁原ゆう, 南早紀
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	19	Raise the FLAG		中村繪里子, 沼倉愛美, 平田宏美, 仁後真耶子
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	20	ザ・ライブ革命でSHOW!		山崎はるか, 郁原ゆう, 大関英里, 愛美, 桐谷蝶々, 夏川椎菜
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	21	Beat the World!!		平田宏美, 戸田めぐみ
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	22	ハルカナミライ		中村繪里子, 山崎はるか
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	23	カーテンコール		中村繪里子, 沼倉愛美, 平田宏美, 原由実, 仁後真耶子, たかはし智秋, 山崎はるか, 郁原ゆう, 平山笑美, 上田麗奈, 大関英里, 近藤唯, 愛美, 南早紀, 原嶋あかり, 伊藤美来, 野村香菜子, 小笠原早紀, 麻倉もも, 戸田めぐみ, 桐谷蝶々, 夏川椎菜, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	24	Brand New Theater!		中村繪里子, 沼倉愛美, 平田宏美, 原由実, 仁後真耶子, たかはし智秋, 山崎はるか, 郁原ゆう, 平山笑美, 上田麗奈, 大関英里, 近藤唯, 愛美, 南早紀, 原嶋あかり, 伊藤美来, 野村香菜子, 小笠原早紀, 麻倉もも, 戸田めぐみ, 桐谷蝶々, 夏川椎菜, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY1	2017/10/7	25	THE IDOLM@STER		中村繪里子, 沼倉愛美, 平田宏美, 原由実, 仁後真耶子, たかはし智秋, 山崎はるか, 郁原ゆう, 平山笑美, 上田麗奈, 大関英里, 近藤唯, 愛美, 南早紀, 原嶋あかり, 伊藤美来, 野村香菜子, 小笠原早紀, 麻倉もも, 戸田めぐみ, 桐谷蝶々, 夏川椎菜, 渡部優衣
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	1	READY!!		今井麻美, 長谷川明子, 若林直美, 浅倉杏美, 下田麻美, 釘宮理恵, 田所あずさ, Machico, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 角元明日香, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 末柄里恵, 髙橋ミナミ, 浜崎奈々, 阿部里果, 山口立花子, 中村温姫
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	2	MEGARE!		若林直美, 駒形友梨
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	3	Sweet Sweet Soul		稲川英里, 田村奈央, 渡部恵子, 髙橋ミナミ
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	4	リフレインキス		小岩井ことり, 諏訪彩花
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	5	Understand? Understand!		釘宮理恵, 渡部恵子
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	6	Shooting Stars		若林直美, 浅倉杏美, 下田麻美, 田所あずさ, Machico, 雨宮天, 角元明日香, 駒形友梨, 藤井ゆきよ, 浜崎奈々, 阿部里果, 山口立花子
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	7	マリオネットの心		長谷川明子, Machico
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	8	arcadia		今井麻美, 雨宮天, 香里有佐, 小岩井ことり
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	9	99 Nights		長谷川明子, 釘宮理恵, 山口立花子
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	10	Little Match Girl		浅倉杏美, 雨宮天, 駒形友梨, 阿部里果
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	11	Eternal Harmony		今井麻美, 長谷川明子, 釘宮理恵, 稲川英里, 田村奈央, 香里有佐, 渡部恵子, 小岩井ことり, 諏訪彩花, 末柄里恵, 髙橋ミナミ, 中村温姫
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	12	ココロ☆エクササイズ		田所あずさ, 藤井ゆきよ, 中村温姫
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	13	求ム VS マイ・フューチャー		下田麻美, 浜崎奈々
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	14	メリー		若林直美, 浅倉杏美, 田村奈央
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	15	DIAMOND DAYS		田所あずさ, Machico, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 角元明日香, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 末柄里恵, 髙橋ミナミ, 浜崎奈々, 阿部里果, 山口立花子, 中村温姫
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	16	ToP!!!!!!!!!!!!!		今井麻美, 長谷川明子, 若林直美, 浅倉杏美, 下田麻美, 釘宮理恵
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	17	おとなのはじまり		香里有佐, 末柄里恵, 髙橋ミナミ, 山口立花子
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	18	Honey Heartbeat		長谷川明子, Machico, 角元明日香, 藤井ゆきよ
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	19	俠気乱舞		今井麻美, 浅倉杏美, 下田麻美, 釘宮理恵
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	20	待ち受けプリンス		角元明日香, 浜崎奈々, 阿部里果, 中村温姫
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	21	ジャングル☆パーティー		若林直美, 下田麻美, 稲川英里, 諏訪彩花, 末柄里恵
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	22	アライブファクター		今井麻美, 田所あずさ
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	23	カーテンコール		今井麻美, 長谷川明子, 若林直美, 浅倉杏美, 下田麻美, 釘宮理恵, 田所あずさ, Machico, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 角元明日香, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 末柄里恵, 髙橋ミナミ, 浜崎奈々, 阿部里果, 山口立花子, 中村温姫
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	24	Brand New Theater!		今井麻美, 長谷川明子, 若林直美, 浅倉杏美, 下田麻美, 釘宮理恵, 田所あずさ, Machico, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 角元明日香, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 末柄里恵, 髙橋ミナミ, 浜崎奈々, 阿部里果, 山口立花子, 中村温姫
HOTCHPOTCH FESTIV@L!! 	DAY2	2017/10/8	25	THE IDOLM@STER		今井麻美, 長谷川明子, 若林直美, 浅倉杏美, 下田麻美, 釘宮理恵, 田所あずさ, Machico, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 角元明日香, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 末柄里恵, 髙橋ミナミ, 浜崎奈々, 阿部里果, 山口立花子, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	1	Brand New Theater!		山崎はるか, 郁原ゆう, 平山笑美, 雨宮天, 香里有佐, 近藤唯, 南早紀, 渡部恵子, 末柄里恵, 原嶋あかり, 伊藤美来, 小笠原早紀, 麻倉もも, 髙橋ミナミ, 戸田めぐみ, 阿部里果, 村川梨衣, 木戸衣吹, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	2	未来系ドリーマー		山崎はるか
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	3	Eternal Harmony		平山笑美, 雨宮天, 麻倉もも, 阿部里果, 村川梨衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	4	AIKANE?		小笠原早紀
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	5	ローリング△さんかく		渡部恵子
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	6	ART NEEDS HEART BEATS		中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	7	教えてlast note…		近藤唯
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	8	花ざかりWeekend✿		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	9	Princess Be Ambitious!!		山崎はるか, 郁原ゆう, 原嶋あかり, 伊藤美来, 村川梨衣, 木戸衣吹
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	10	Angelic Parade♪		平山笑美, 香里有佐, 近藤唯, 末柄里恵, 小笠原早紀, 麻倉もも, 髙橋ミナミ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	11	あめにうたおう♪		木戸衣吹
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	12	ときどきシーソー		原嶋あかり
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	13	Come on a Tea Party!		麻倉もも
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	14	Take! 3. 2. 1. → S・P・A・C・E↑↑		村川梨衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	15	Oli Oli DISCO		戸田めぐみ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	16	空に手が触れる場所		平山笑美
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	17	Sentimental Venus		渡部恵子, 原嶋あかり, 小笠原早紀, 髙橋ミナミ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	18	FairyTaleじゃいられない		雨宮天, 南早紀, 渡部恵子, 戸田めぐみ, 阿部里果, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	19	ZETTAI×BREAK!! トゥインクルリズム		原嶋あかり, 伊藤美来, 村川梨衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	20	Marionetteは眠らない		山崎はるか, 郁原ゆう, 末柄里恵, 木戸衣吹, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	21	Silent Joker		阿部里果
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	22	CAT CROSSING		雨宮天
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	23	To...		髙橋ミナミ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	24	地球儀にない国		伊藤美来
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	25	星屑のシンフォニア		近藤唯, 南早紀, 渡部恵子, 戸田めぐみ, 木戸衣吹
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	26	Melty Fantasia		阿部里果, 南早紀, 雨宮天
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	27	はなしらべ		郁原ゆう
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	28	祈りの羽根		末柄里恵
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	29	ココロがかえる場所		郁原ゆう, 香里有佐, 近藤唯, 戸田めぐみ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	30	Birth of Color		山崎はるか, 伊藤美来, 小笠原早紀, 麻倉もも, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	31	瑠璃色金魚と花菖蒲		南早紀
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	32	ハミングバード		香里有佐
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	33	Dreaming!		山崎はるか, 郁原ゆう, 平山笑美, 雨宮天, 香里有佐, 近藤唯, 南早紀, 渡部恵子, 末柄里恵, 原嶋あかり, 伊藤美来, 小笠原早紀, 麻倉もも, 髙橋ミナミ, 戸田めぐみ, 阿部里果, 村川梨衣, 木戸衣吹, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	34	UNION!!		山崎はるか, 郁原ゆう, 平山笑美, 雨宮天, 香里有佐, 近藤唯, 南早紀, 渡部恵子, 末柄里恵, 原嶋あかり, 伊藤美来, 小笠原早紀, 麻倉もも, 髙橋ミナミ, 戸田めぐみ, 阿部里果, 村川梨衣, 木戸衣吹, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY1	2018/6/2	35	Thank You!		山崎はるか, 郁原ゆう, 平山笑美, 雨宮天, 香里有佐, 近藤唯, 南早紀, 渡部恵子, 末柄里恵, 原嶋あかり, 伊藤美来, 小笠原早紀, 麻倉もも, 髙橋ミナミ, 戸田めぐみ, 阿部里果, 村川梨衣, 木戸衣吹, 中村温姫
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	1	Brand New Theater!		田所あずさ, Machico, 稲川英里, 田村奈央, 上田麗奈, 大関英里, 角元明日香, 愛美, 駒形友梨, 種田梨沙, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 野村香菜子, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 山口立花子, 渡部優衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	2	FairyTaleじゃいられない		田所あずさ, 愛美, 小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	3	虹色letters		角元明日香, 桐谷蝶々
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	4	ドリームトラベラー		Machico, 愛美, 種田梨沙, 諏訪彩花, 渡部優衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	5	Only One Second		駒形友梨
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	6	WE ARE ONE!!		浜崎奈々
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	7	Hearty!!		藤井ゆきよ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	8	Home is a coming now!		渡部優衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	9	Border LINE→→→♡		山口立花子
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	10	Angelic Parade♪		Machico, 稲川英里, 田村奈央, 角元明日香, 桐谷蝶々, 夏川椎菜
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	11	咲くは浮世の君花火		上田麗奈, 大関英里, 駒形友梨, 浜崎奈々, 渡部優衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	12	Good-Sleep, Baby♡		Machico, 田村奈央, 角元明日香, 夏川椎菜
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	13	HOME, SWEET FRIENDSHIP		田所あずさ, 稲川英里, 愛美, 駒形友梨, 山口立花子
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	14	プリンセス・アラモード		諏訪彩花
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	15	満腹至極フルコォス		大関英里
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	16	たんけんぼうけん☆ハイホー隊		稲川英里
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	17	スポーツ！スポーツ！スポーツ！		上田麗奈
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	18	Sister		小岩井ことり
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	19	ふわりずむ		桐谷蝶々
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	20	スノウレター		田村奈央
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	21	昏き星、遠い月		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	22	Princess Be Ambitious!!		上田麗奈, 大関英里, 駒形友梨, 種田梨沙, 諏訪彩花, 浜崎奈々, 渡部優衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	23	シャクネツのパレード		角元明日香
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	24	ENTER→PLEASURE		夏川椎菜
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	25	ロケットスター☆		Machico
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	26	ジレるハートに火をつけて		種田梨沙, 稲川英里, 上田麗奈, 藤井ゆきよ, 桐谷蝶々
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	27	Blue Symphony		大関英里, 小岩井ことり, 諏訪彩花, 野村香菜子
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	28	STANDING ALIVE		田所あずさ, 田村奈央, 浜崎奈々, 夏川椎菜
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	29	ムーンゴールド		野村香菜子
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	30	スタートリップ		愛美
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	31	シルエット		種田梨沙
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	32	SING MY SONG		田所あずさ
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	33	Dreaming!		田所あずさ, Machico, 稲川英里, 田村奈央, 上田麗奈, 大関英里, 角元明日香, 愛美, 駒形友梨, 種田梨沙, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 野村香菜子, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 山口立花子, 渡部優衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	34	UNION!!		田所あずさ, Machico, 稲川英里, 田村奈央, 上田麗奈, 大関英里, 角元明日香, 愛美, 駒形友梨, 種田梨沙, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 野村香菜子, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 山口立花子, 渡部優衣
5thLIVE BRAND NEW PERFORM@NCE!!!	DAY2	2018/6/3	35	Thank You!		田所あずさ, Machico, 稲川英里, 田村奈央, 上田麗奈, 大関英里, 角元明日香, 愛美, 駒形友梨, 種田梨沙, 小岩井ことり, 諏訪彩花, 藤井ゆきよ, 野村香菜子, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 山口立花子, 渡部優衣
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	1	Angelic Parade♪		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	2	ピコピコIIKO！インベーダー		麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	3	スマイル体操	ピコピコ体操バージョン	麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	4	Get lol! Get lol! SONG		麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	5	虹色letters		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	6	笑って！		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	7	想い出はクリアスカイ		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	8	ハルマチ女子		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	9	Do-Dai		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	10	彼氏になってよ。		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	11	RED ZONE		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	12	9:02pm		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	13	ID:[OL]	セレブレイション！バージョン	香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	14	花ざかりWeekend✿		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	15	サンリズム・オーケストラ♪		田村奈央, 香里有佐, 末柄里恵
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	16	プリティ〜〜〜ッ→ニャンニャンッ！		小笠原早紀
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	17	教えてlast note…		近藤唯
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	18	初恋バタフライ		桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	19	ハミングバード		香里有佐
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	20	Sweet Sweet Soul		稲川英里, 小笠原早紀, 麻倉もも
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	21	水中キャンディ		髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	22	BOUNCING♪ SMILE!		稲川英里
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	23	夢色トレイン		麻倉もも
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	24	G♡F		近藤唯, 髙橋ミナミ, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	25	ジャングル☆パーティー		Machico, 平山笑美, 角元明日香, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	26	DIAMOND DAYS		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	27	UNION!!		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演1日目	2019/4/27	28	Brand New Theater!		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	1	Angelic Parade♪		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	2	ピコピコIIKO！インベーダー		麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	3	スマイル体操	ピコピコ体操バージョン	麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	4	Get lol! Get lol! SONG		麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	5	虹色letters		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	6	笑って！		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	7	想い出はクリアスカイ		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	8	ハルマチ女子		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	9	Do-Dai		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	10	彼氏になってよ。		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	11	RED ZONE		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	12	9:02pm		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	13	ID:[OL]	セレブレイション！バージョン	香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	14	花ざかりWeekend✿		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	15	ジャングル☆パーティー		Machico, 平山笑美, 角元明日香, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	16	bitter sweet		末柄里恵
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	17	りんごのマーチ		田村奈央
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	18	ファンタジスタ・カーニバル		角元明日香
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	19	Sweet Sweet Soul		稲川英里, 小笠原早紀, 麻倉もも
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	20	G♡F		近藤唯, 髙橋ミナミ, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	21	FIND YOUR WIND!		平山笑美
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	22	Happy Darling		夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	23	ロケットスター☆		Machico
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	24	サンリズム・オーケストラ♪		田村奈央, 香里有佐, 末柄里恵
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	25	DIAMOND DAYS		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	26	UNION!!		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	仙台公演2日目	2019/4/28	27	Brand New Theater!		角元明日香, 桐谷蝶々, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 近藤唯, 小笠原早紀, Machico, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	1	Princess Be Ambitious!!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	2	Episode. Tiara		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	3	まっすぐ		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	4	ギブミーメタファー		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	5	だってあなたはプリンセス		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	6	フタリの記憶		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	7	魔法をかけて！	Princess Magic ver	諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	8	ミラージュ・ミラー		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	9	ZETTAI×BREAK!! トゥインクルリズム		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	10	Fate of the World		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	11	Tomorrow Program		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	12	BORN ON DREAM! 〜HANABI☆NIGHT〜		駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	13	MOONY	打上げ☆HANABI ver	駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	14	咲くは浮世の君花火		駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	15	メメント？モメント♪ルルルルル☆		山崎はるか, 諏訪彩花, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	16	WE ARE ONE!!		浜崎奈々
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	17	Only One Second		駒形友梨
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	18	あめにうたおう♪		木戸衣吹
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	19	朝焼けのクレッシェンド		種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	20	Starry Melody		郁原ゆう, 駒形友梨, 伊藤美来, 木戸衣吹
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	21	Understand? Understand!		上田麗奈, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	22	満腹至極フルコォス		大関英里
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	23	チョー↑元気Show☆アイドルch@ng!		村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	24	プリンセス・アラモード		諏訪彩花
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	25	PRETTY DREAMER		大関英里, 原嶋あかり, 浜崎奈々, 渡部優衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	26	DIAMOND DAYS		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	27	UNION!!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演1日目	2019/5/18	28	Brand New Theater!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	1	Princess Be Ambitious!!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	2	Episode. Tiara		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	3	まっすぐ		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	4	ギブミーメタファー		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	5	だってあなたはプリンセス		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	6	フタリの記憶		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	7	魔法をかけて！	Princess Magic ver	諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	8	ミラージュ・ミラー		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	9	ZETTAI×BREAK!! トゥインクルリズム		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	10	Fate of the World		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	11	Tomorrow Program		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	12	BORN ON DREAM! 〜HANABI☆NIGHT〜		駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	13	MOONY	打上げ☆HANABI ver	駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	14	咲くは浮世の君花火		駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	15	PRETTY DREAMER		大関英里, 原嶋あかり, 浜崎奈々, 渡部優衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	16	スポーツ！スポーツ！スポーツ！		上田麗奈
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	17	アニマル☆ステイション！		原嶋あかり
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	18	Super Lover		渡部優衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	19	メメント？モメント♪ルルルルル☆		山崎はるか, 諏訪彩花, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	20	Understand? Understand!		上田麗奈, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	21	微笑み日和		郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	22	地球儀にない国		伊藤美来
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	23	未来飛行		山崎はるか
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	24	Starry Melody		郁原ゆう, 駒形友梨, 伊藤美来, 木戸衣吹
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	25	DIAMOND DAYS		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	26	UNION!!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	神戸公演2日目	2019/5/19	27	Brand New Theater!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	1	FairyTaleじゃいられない		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	2	ハーモニクス		愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	3	流星群	アコースティックver.	愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	4	SING MY SONG	アコースティックver.	愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	5	餞の鳥		愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	6	昏き星、遠い月		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	7	Everlasting		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	8	I.D〜EScape from Utopia〜		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	9	Mythmaker		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	10	Melty Fantasia		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	11	LOST		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	12	ART NEEDS HEART BEATS	Four Hearts Beans	中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	13	I did+I will		中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	14	月曜日のクリームソーダ		中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	15	Border LINE→→→♡		山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	16	STEREOPHONIC ISOTONIC		中村温姫
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	17	Oli Oli DISCO		戸田めぐみ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	18	瑠璃色金魚と花菖蒲		南早紀
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	19	スタートリップ		愛美
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	20	Decided		田所あずさ, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	21	brave HARMONY		南早紀, 斉藤佑圭, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	22	Silent Joker		阿部里果
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	23	鳥籠スクリプチュア		小岩井ことり
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	24	Raise the FLAG		藤井ゆきよ, 戸田めぐみ, 阿部里果
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	25	俠気乱舞		愛美, 渡部恵子, 小岩井ことり, 中村温姫
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	26	DIAMOND DAYS		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	27	UNION!!		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演1日目	2019/6/29	28	Brand New Theater!		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	1	FairyTaleじゃいられない		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	2	ハーモニクス		愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	3	流星群	アコースティックver.	愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	4	SING MY SONG	アコースティックver.	愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	5	餞の鳥		愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	6	昏き星、遠い月		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	7	Everlasting		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	8	I.D〜EScape from Utopia〜		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	9	Mythmaker		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	10	Melty Fantasia		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	11	LOST		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	12	ART NEEDS HEART BEATS	Four Hearts Beans	中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	13	I did+I will		中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	14	月曜日のクリームソーダ		中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	15	Decided		田所あずさ, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	16	恋心マスカレード		野村香菜子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	17	ライアー・ルージュ		雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	18	フローズン・ワード		藤井ゆきよ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	19	Catch my dream		田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	20	brave HARMONY		南早紀, 斉藤佑圭, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	21	ローリング△さんかく		渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	22	HOME RUN SONG♪		斉藤佑圭
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	23	Raise the FLAG		藤井ゆきよ, 戸田めぐみ, 阿部里果
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	24	俠気乱舞		愛美, 渡部恵子, 小岩井ことり, 中村温姫
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	25	DIAMOND DAYS		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	26	UNION!!		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	福岡公演2日目	2019/6/30	27	Brand New Theater!		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	1	Brand New Theater!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子, 角元明日香, 桐谷蝶々, 近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	2	BORN ON DREAM! 〜HANABI☆NIGHT〜		駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	3	MOONY	打上げ☆HANABI ver	駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	4	咲くは浮世の君花火		駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	5	ハルマチ女子		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	6	Do-Dai		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	7	彼氏になってよ。		近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	8	fruity love		中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子, 近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	9	ビッグバンズバリボー!!!!!		駒形友梨, 上田麗奈, 渡部優衣, 藤井ゆきよ, 末柄里恵
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	10	虹色letters		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	11	笑って！		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	12	思い出はクリアスカイ		角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	13	ラムネ色 青春		駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 角元明日香, 桐谷蝶々
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	14	ART NEEDS HEART BEATS	Four Hearts Beans	中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	15	I did+I will		中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	16	月曜日のクリームソーダ		中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	17	オーディナリィ・クローバー		田所あずさ, 桐谷蝶々, 香里有佐, 夏川椎菜, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	18	ZETTAI×BREAK!! トゥインクルリズム		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	19	Fate of the World		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	20	Tomorrow Program		原嶋あかり, 伊藤美来, 村川梨衣
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	21	インヴィンシブル・ジャスティス		上田麗奈, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	22	ハーモニクス		愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	23	餞の鳥		愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	24	創造は始まりの風を連れて		原嶋あかり, 伊藤美来, 村川梨衣, 愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	25	アライブファクター		愛美, 田所あずさ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	26	DIAMOND DAYS		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子, 角元明日香, 桐谷蝶々, 近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	27	UNION!!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子, 角元明日香, 桐谷蝶々, 近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	28	Flyers!!!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子, 角元明日香, 桐谷蝶々, 近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演1日目	2019/9/21	29	Thank You!		原嶋あかり, 伊藤美来, 村川梨衣, 駒形友梨, 上田麗奈, 浜崎奈々, 渡部優衣, 大関英里, 愛美, 田所あずさ, 中村温姫, 戸田めぐみ, 斉藤佑圭, 渡部恵子, 角元明日香, 桐谷蝶々, 近藤唯, 小笠原早紀, Machico
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	1	Brand New Theater!		諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙, 小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	2	RED ZONE		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	3	晴れ色		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	4	プライヴェイト・ロードショウ (playback, Weekday)		諏訪彩花, 郁原ゆう, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	5	花ざかりWeekend✿		香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	6	昏き星、遠い月		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	7	Everlasting		小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	8	ラスト・アクトレス		種田梨沙, 阿部里果, 南早紀, 髙橋ミナミ, 渡部恵子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	9	ミラージュ・ミラー		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	10	魔法をかけて！	Princess Magic ver	諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	11	だってあなたはプリンセス		諏訪彩花, 郁原ゆう
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	12	I.D〜EScape from Utopia〜		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	13	Melty Fantasia		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	14	LOST		阿部里果, 南早紀, 雨宮天
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	15	White Vows		野村香菜子, 山口立花子, 香里有佐, 末柄里恵, 髙橋ミナミ
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	16	Episode. Tiara		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	17	私はアイドル♥	M@STER VERSION	山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	18	ギブミーメタファー		山崎はるか, 木戸衣吹, 種田梨沙
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	19	赤い世界が消える頃		山崎はるか, 木戸衣吹, 種田梨沙, 小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	20	Justice OR Voice		南早紀, 香里有佐, 愛美, 小笠原早紀
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	21	ピコピコIIKO！インベーダー		麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	22	スマイル体操	ピコピコ体操バージョン	麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	23	Get lol! Get lol! SONG		麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	24	フェスタ・イルミネーション		阿部里果, 南早紀, 雨宮天, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜, 諏訪彩花
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	25	DIAMOND DAYS		諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙, 小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	26	UNION!!		諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙, 小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	27	Flyers!!!		諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙, 小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
6thLIVE TOUR UNI-ON@IR!!!!	SSA公演2日目	2019/9/22	28	Thank You!		諏訪彩花, 郁原ゆう, 山崎はるか, 木戸衣吹, 種田梨沙, 小岩井ことり, 藤井ゆきよ, 野村香菜子, 山口立花子, 阿部里果, 南早紀, 雨宮天, 香里有佐, 末柄里恵, 平山笑美, 髙橋ミナミ, 麻倉もも, 田村奈央, 稲川英里, 夏川椎菜
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	1	Flyers!!!		田所あずさ, 郁原ゆう, 平山笑美, 雨宮天, 田村奈央, 香里有佐, 大関英里, 愛美, 近藤唯, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 原嶋あかり, 小笠原早紀, 麻倉もも, 村川梨衣, 渡部優衣
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	2	Legend Girls!!		田所あずさ, 郁原ゆう, 平山笑美, 雨宮天, 田村奈央, 香里有佐, 大関英里, 愛美, 近藤唯, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 原嶋あかり, 小笠原早紀, 麻倉もも, 村川梨衣, 渡部優衣
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	3	ランニング・ハイッ		駒形友梨, 郁原ゆう, 渡部優衣, 田村奈央, 平山笑美
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	4	アニマル☆ステイション！		南早紀, 諏訪彩花, 雨宮天, 原嶋あかり, 田所あずさ, 小笠原早紀
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	5	Helloコンチェルト		大関英里, 村川梨衣, 田村奈央
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	6	空に手が触れる場所		小笠原早紀, 平山笑美
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	7	HOME, SWEET FRIENDSHIP		原嶋あかり, 小岩井ことり, 村川梨衣, 渡部恵子, 渡部優衣, 近藤唯, 麻倉もも
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	8	Bigバルーン◎		小岩井ことり, 諏訪彩花, 近藤唯, 小笠原早紀, 愛美, 南早紀
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	9	Good-Sleep, Baby♡		渡部恵子, 原嶋あかり, 田村奈央, 香里有佐
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	10	夢色トレイン		郁原ゆう, 麻倉もも
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	11	Melody in scape		大関英里, 駒形友梨
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	12	君だけの欠片		諏訪彩花, 郁原ゆう
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	13	Flooding		小笠原早紀, 麻倉もも, 田所あずさ, 雨宮天, 平山笑美
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	14	Do the IDOL!! 〜断崖絶壁チュパカブラ〜		村川梨衣, 郁原ゆう, 小岩井ことり, 田所あずさ, 近藤唯
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	15	SUPER SIZE LOVE!!		原嶋あかり, 小笠原早紀, 大関英里, 諏訪彩花
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	16	ココロがかえる場所		田村奈央, 愛美, 渡部恵子, 南早紀
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	17	夕風のメロディー		香里有佐, 近藤唯, 駒形友梨
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	18	Super Duper		渡部優衣, 大関英里
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	19	百花は月下に散りぬるを		小岩井ことり, 郁原ゆう, 南早紀
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	20	Blue Symphony		麻倉もも, 平山笑美, 雨宮天, 田所あずさ, 香里有佐
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	21	夜に輝く星座のように		渡部優衣, 村川梨衣
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	22	待ちぼうけのLacrima		駒形友梨, 平山笑美, 愛美
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	23	絵本		香里有佐, 雨宮天
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	24	流星群		渡部恵子, 愛美
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	25	星屑のシンフォニア		諏訪彩花, 小岩井ことり, 田所あずさ, 駒形友梨, 麻倉もも, 田村奈央, 香里有佐
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	26	STANDING ALIVE		渡部恵子, 南早紀, 雨宮天, 原嶋あかり, 近藤唯, 村川梨衣, 愛美, 渡部優衣, 大関英里
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	27	brave HARMONY		田所あずさ, 郁原ゆう, 平山笑美, 雨宮天, 田村奈央, 香里有佐, 大関英里, 愛美, 近藤唯, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 原嶋あかり, 小笠原早紀, 麻倉もも, 村川梨衣, 渡部優衣
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	28	なんどでも笑おう		田所あずさ, 郁原ゆう, 平山笑美, 雨宮天, 田村奈央, 香里有佐, 大関英里, 愛美, 近藤唯, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 原嶋あかり, 小笠原早紀, 麻倉もも, 村川梨衣, 渡部優衣
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	29	Glow Map		田所あずさ, 郁原ゆう, 平山笑美, 雨宮天, 田村奈央, 香里有佐, 大関英里, 愛美, 近藤唯, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 原嶋あかり, 小笠原早紀, 麻倉もも, 村川梨衣, 渡部優衣
7thLIVE Q@MP FLYER!!! Reburn	DAY1	2021/5/22	30	Thank You!		田所あずさ, 郁原ゆう, 平山笑美, 雨宮天, 田村奈央, 香里有佐, 大関英里, 愛美, 近藤唯, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 諏訪彩花, 原嶋あかり, 小笠原早紀, 麻倉もも, 村川梨衣, 渡部優衣
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	1	Flyers!!!		山崎はるか, Machico, 稲川英里, 上田麗奈, 角元明日香, 種田梨沙, 藤井ゆきよ, 末柄里恵, 伊藤美来, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 夏川椎菜, 山口立花子, 木戸衣吹, 中村温姫
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	2	サンリズム・オーケストラ♪		山崎はるか, Machico, 稲川英里, 上田麗奈, 角元明日香, 種田梨沙, 藤井ゆきよ, 末柄里恵, 伊藤美来, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 夏川椎菜, 山口立花子, 木戸衣吹, 中村温姫
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	3	ジャングル☆パーティー		木戸衣吹, 稲川英里, 中村温姫, 髙橋ミナミ
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	4	Growing Storm!		阿部里果, Machico, 山崎はるか, 伊藤美来, 夏川椎菜
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	5	マイペース☆マイウェイ		浜崎奈々, 桐谷蝶々
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	6	未来飛行		種田梨沙, 山崎はるか, 木戸衣吹
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	7	成長Chu→LOVER!!		伊藤美来, 夏川椎菜
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	8	絶対的Performer		上田麗奈, 浜崎奈々, 角元明日香
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	9	ホップ♪ステップ♪レインボウ♪		種田梨沙, 稲川英里, 木戸衣吹, 藤井ゆきよ
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	10	ファンタジスタ・カーニバル		角元明日香, 桐谷蝶々
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	11	ビッグバンズバリボー!!!!!		中村温姫, 山崎はるか
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	12	ココロ☆エクササイズ		浜崎奈々, 上田麗奈, 角元明日香
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	13	Do the IDOL!! 〜断崖絶壁チュパカブラ〜		伊藤美来, 山口立花子, 桐谷蝶々, Machico
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	14	Eternal Harmony		種田梨沙, 藤井ゆきよ, 末柄里恵, 阿部里果, 中村温姫
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	15	インヴィンシブル・ジャスティス		Machico, 伊藤美来, 上田麗奈
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	16	NO CURRY NO LIFE		木戸衣吹, 夏川椎菜, 山口立花子
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	17	ドリームトラベラー		中村温姫, Machico, 髙橋ミナミ, 浜崎奈々
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	18	オレンジの空の下		稲川英里, 末柄里恵, 桐谷蝶々, 木戸衣吹
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	19	カワラナイモノ		角元明日香, 藤井ゆきよ, 種田梨沙
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	20	ジレるハートに火をつけて		稲川英里, 藤井ゆきよ, 上田麗奈, 種田梨沙, 桐谷蝶々
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	21	dans l'obscurité		阿部里果, 夏川椎菜, 伊藤美来, 中村温姫
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	22	Cherry Colored Love		山口立花子, 髙橋ミナミ
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	23	瞳の中のシリウス		髙橋ミナミ, 阿部里果, 山崎はるか, 末柄里恵
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	24	Marionetteは眠らない		山口立花子, Machico, 夏川椎菜, 角元明日香
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	25	Raise the FLAG		末柄里恵, 藤井ゆきよ, 山崎はるか, 上田麗奈, 阿部里果, 浜崎奈々
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	26	Starry Melody		山崎はるか, Machico, 稲川英里, 上田麗奈, 角元明日香, 種田梨沙, 藤井ゆきよ, 末柄里恵, 伊藤美来, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 夏川椎菜, 山口立花子, 木戸衣吹, 中村温姫
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	27	なんどでも笑おう		山崎はるか, Machico, 稲川英里, 上田麗奈, 角元明日香, 種田梨沙, 藤井ゆきよ, 末柄里恵, 伊藤美来, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 夏川椎菜, 山口立花子, 木戸衣吹, 中村温姫
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	28	Glow Map		山崎はるか, Machico, 稲川英里, 上田麗奈, 角元明日香, 種田梨沙, 藤井ゆきよ, 末柄里恵, 伊藤美来, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 夏川椎菜, 山口立花子, 木戸衣吹, 中村温姫
7thLIVE Q@MP FLYER!!! Reburn	DAY2	2021/5/23	29	Thank You!		山崎はるか, Machico, 稲川英里, 上田麗奈, 角元明日香, 種田梨沙, 藤井ゆきよ, 末柄里恵, 伊藤美来, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 夏川椎菜, 山口立花子, 木戸衣吹, 中村温姫
8thLIVE Twelw@ve	DAY1	2022/2/12	1	百花は月下に散りぬるを		郁原ゆう, 南早紀
8thLIVE Twelw@ve	DAY1	2022/2/12	2	矛盾の月		郁原ゆう, 南早紀
8thLIVE Twelw@ve	DAY1	2022/2/12	3	俠気乱舞		郁原ゆう, 南早紀
8thLIVE Twelw@ve	DAY1	2022/2/12	4	My Evolution		浜崎奈々, 角元明日香
8thLIVE Twelw@ve	DAY1	2022/2/12	5	Sweet Sweet Soul		浜崎奈々, 角元明日香
8thLIVE Twelw@ve	DAY1	2022/2/12	6	絶対的Performer		浜崎奈々, 角元明日香
8thLIVE Twelw@ve	DAY1	2022/2/12	7	Arrive You 〜それが運命でも〜		稲川英里, 原嶋あかり, 渡部恵子
8thLIVE Twelw@ve	DAY1	2022/2/12	8	dear...		稲川英里, 原嶋あかり, 渡部恵子
8thLIVE Twelw@ve	DAY1	2022/2/12	9	ライラックにつつまれて		稲川英里, 原嶋あかり, 渡部恵子
8thLIVE Twelw@ve	DAY1	2022/2/12	10	夜と、明かりと。		髙橋ミナミ, 山口立花子
8thLIVE Twelw@ve	DAY1	2022/2/12	11	嘆きのFRACTION		髙橋ミナミ, 山口立花子
8thLIVE Twelw@ve	DAY1	2022/2/12	12	Cherry Colored Love		髙橋ミナミ, 山口立花子
8thLIVE Twelw@ve	DAY1	2022/2/12	13	ReTale		藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY1	2022/2/12	14	プラリネ		藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY1	2022/2/12	15	パンとフィルム		藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY1	2022/2/12	16	Parade d'amour		雨宮天, 香里有佐, 諏訪彩花, 種田梨沙
8thLIVE Twelw@ve	DAY1	2022/2/12	17	星宙のVoyage		雨宮天, 香里有佐, 諏訪彩花, 種田梨沙
8thLIVE Twelw@ve	DAY1	2022/2/12	18	MUSIC JOURNEY		雨宮天, 香里有佐, 諏訪彩花, 種田梨沙
8thLIVE Twelw@ve	DAY1	2022/2/12	19	White Vows		雨宮天, 香里有佐, 諏訪彩花, 種田梨沙
8thLIVE Twelw@ve	DAY1	2022/2/12	20	リフレインキス		髙橋ミナミ, 山口立花子, 藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY1	2022/2/12	21	fruity love		浜崎奈々, 角元明日香, 稲川英里, 原嶋あかり, 渡部恵子
8thLIVE Twelw@ve	DAY1	2022/2/12	22	G♡F		髙橋ミナミ, 山口立花子, 郁原ゆう, 南早紀, 稲川英里, 原嶋あかり, 渡部恵子
8thLIVE Twelw@ve	DAY1	2022/2/12	23	ラ♥︎ブ♥︎リ♥︎		浜崎奈々, 角元明日香, 雨宮天, 香里有佐, 諏訪彩花, 種田梨沙, 藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY1	2022/2/12	24	ショコラブル*イブ		髙橋ミナミ, 山口立花子, 郁原ゆう, 南早紀, 浜崎奈々, 角元明日香, 雨宮天, 香里有佐, 諏訪彩花, 種田梨沙, 稲川英里, 原嶋あかり, 渡部恵子, 藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY1	2022/2/12	25	Harmony 4 You		髙橋ミナミ, 山口立花子, 郁原ゆう, 南早紀, 浜崎奈々, 角元明日香, 雨宮天, 香里有佐, 諏訪彩花, 種田梨沙, 稲川英里, 原嶋あかり, 渡部恵子, 藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY1	2022/2/12	26	Thank You!		髙橋ミナミ, 山口立花子, 郁原ゆう, 南早紀, 浜崎奈々, 角元明日香, 雨宮天, 香里有佐, 諏訪彩花, 種田梨沙, 稲川英里, 原嶋あかり, 渡部恵子, 藤井ゆきよ, 村川梨衣, 木戸衣吹
8thLIVE Twelw@ve	DAY2	2022/2/13	1	Hang In There!		大関英里, 渡部優衣
8thLIVE Twelw@ve	DAY2	2022/2/13	2	追憶のサンドグラス	sky_delta REMIX	大関英里, 渡部優衣
8thLIVE Twelw@ve	DAY2	2022/2/13	3	Super Duper		大関英里, 渡部優衣
8thLIVE Twelw@ve	DAY2	2022/2/13	4	Special Wonderful Smile		近藤唯, 麻倉もも, 桐谷蝶々
8thLIVE Twelw@ve	DAY2	2022/2/13	5	旅立ちのコンパス		近藤唯, 麻倉もも, 桐谷蝶々
8thLIVE Twelw@ve	DAY2	2022/2/13	6	オーディナリィ・クローバー		近藤唯, 麻倉もも, 桐谷蝶々
8thLIVE Twelw@ve	DAY2	2022/2/13	7	フシギトラベラー		平山笑美, 小笠原早紀
8thLIVE Twelw@ve	DAY2	2022/2/13	8	CAT CROSSING		平山笑美, 小笠原早紀
8thLIVE Twelw@ve	DAY2	2022/2/13	9	Black★Party		平山笑美, 小笠原早紀
8thLIVE Twelw@ve	DAY2	2022/2/13	10	囚われのTeaTime		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果
8thLIVE Twelw@ve	DAY2	2022/2/13	11	Maria Trap		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果
8thLIVE Twelw@ve	DAY2	2022/2/13	12	dans l'obscurité		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果
8thLIVE Twelw@ve	DAY2	2022/2/13	13	Paradox of LOVE		駒形友梨, 末柄里恵, 愛美, 野村香菜子
8thLIVE Twelw@ve	DAY2	2022/2/13	14	Eternal Spiral		駒形友梨, 末柄里恵, 愛美, 野村香菜子
8thLIVE Twelw@ve	DAY2	2022/2/13	15	深紅のパシオン		駒形友梨, 末柄里恵, 愛美, 野村香菜子
8thLIVE Twelw@ve	DAY2	2022/2/13	16	ABSOLUTE RUN!!!		山崎はるか, 田所あずさ, Machico
8thLIVE Twelw@ve	DAY2	2022/2/13	17	君との明日を願うから		山崎はるか, 田所あずさ, Machico
8thLIVE Twelw@ve	DAY2	2022/2/13	18	Be proud		山崎はるか, 田所あずさ, Machico
8thLIVE Twelw@ve	DAY2	2022/2/13	19	恋花		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果, 駒形友梨, 末柄里恵, 愛美, 野村香菜子
8thLIVE Twelw@ve	DAY2	2022/2/13	20	プリンセス・アラモード		大関英里, 渡部優衣, 平山笑美, 小笠原早紀
8thLIVE Twelw@ve	DAY2	2022/2/13	21	Happy Darling		近藤唯, 麻倉もも, 桐谷蝶々, 山崎はるか, 田所あずさ, Machico
8thLIVE Twelw@ve	DAY2	2022/2/13	22	自転車		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果, 大関英里, 渡部優衣, 山崎はるか, 田所あずさ, Machico
8thLIVE Twelw@ve	DAY2	2022/2/13	23	成長Chu→LOVER!!		近藤唯, 麻倉もも, 桐谷蝶々, 平山笑美, 小笠原早紀, 駒形友梨, 末柄里恵, 愛美, 野村香菜子
8thLIVE Twelw@ve	DAY2	2022/2/13	24	ショコラブル*イブ		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果, 大関英里, 渡部優衣, 近藤唯, 麻倉もも, 桐谷蝶々, 平山笑美, 小笠原早紀, 駒形友梨, 末柄里恵, 愛美, 野村香菜子, 山崎はるか, 田所あずさ, Machico
8thLIVE Twelw@ve	DAY2	2022/2/13	25	Harmony 4 You		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果, 大関英里, 渡部優衣, 近藤唯, 麻倉もも, 桐谷蝶々, 平山笑美, 小笠原早紀, 駒形友梨, 末柄里恵, 愛美, 野村香菜子, 山崎はるか, 田所あずさ, Machico
8thLIVE Twelw@ve	DAY2	2022/2/13	26	Thank You!		斉藤佑圭, 中村温姫, 夏川椎菜, 阿部里果, 大関英里, 渡部優衣, 近藤唯, 麻倉もも, 桐谷蝶々, 平山笑美, 小笠原早紀, 駒形友梨, 末柄里恵, 愛美, 野村香菜子, 山崎はるか, 田所あずさ, Machico
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	1	夢にかけるRainbow		Machico, 平山笑美, 近藤唯, 角元明日香, 南早紀, 渡部恵子, 諏訪彩花, 末柄里恵, 原嶋あかり, 伊藤美来, 野村香菜子, 麻倉もも, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 渡部優衣
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	2	brave HARMONY	ChoruSp@rkle!! MIX	浜崎奈々, 夏川椎菜, Machico, 末柄里恵
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	3	稲妻スピリット		渡部優衣
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	4	勇気のfragrance		近藤唯
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	5	愛のMagic! Once Again!		角元明日香
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	6	Walking on the Square		桐谷蝶々
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	7	創造は始まりの風を連れて	ChoruSp@rkle!! MIX	近藤唯, 渡部恵子, 諏訪彩花, 野村香菜子, 渡部優衣
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	8	裏表深層心理		末柄里恵
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	9	Collier De Perles		野村香菜子
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	10	シャル・ウィー・ダンス？		諏訪彩花
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	11	絵羽模様		郁原ゆう
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	12	折紙物語		南早紀
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	13	永遠の花	ChoruSp@rkle!! MIX	平山笑美, 原嶋あかり, 麻倉もも, 桐谷蝶々
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	14	HOME, SWEET FRIENDSHIP	ChoruSp@rkle!! MIX	伊藤美来, 南早紀, 角元明日香
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	15	リーチ・アップ・ステップ！		渡部恵子
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	16	キミが真ん中にいた		原嶋あかり
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	17	スポットライト・ミラーランド		夏川椎菜
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	18	恋のWa・Wo・N		伊藤美来
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	19	ダイヤモンド・クラリティ		渡部恵子, 諏訪彩花, Machico, 桐谷蝶々
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	20	Shamrock Vivace		角元明日香, 野村香菜子, 麻倉もも, 渡部優衣
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	21	空色♡ Birthday Card		浜崎奈々, 平山笑美, 伊藤美来, 夏川椎菜
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	22	ESPADA		末柄里恵, 近藤唯, 原嶋あかり, 南早紀
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	23	きまぐれユモレスク		麻倉もも
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	24	きみがくれた言葉があるから		浜崎奈々
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	25	ふたり繋ぐ星座		平山笑美
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	26	泣き空、のち		Machico
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	27	FairyTaleじゃいられない	ChoruSp@rkle!! MIX	浜崎奈々, 伊藤美来, 平山笑美, 麻倉もも, 夏川椎菜, 渡部優衣, 桐谷蝶々
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	28	咲くは浮世の君花火	ChoruSp@rkle!! MIX	原嶋あかり, 角元明日香, 南早紀, 諏訪彩花, 末柄里恵, Machico, 渡部恵子, 近藤唯, 野村香菜子
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	29	DIAMOND DAYS	ChoruSp@rkle!! MIX	Machico, 平山笑美, 近藤唯, 角元明日香, 南早紀, 渡部恵子, 諏訪彩花, 末柄里恵, 原嶋あかり, 伊藤美来, 野村香菜子, 麻倉もも, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 渡部優衣
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	30	セブンカウント		Machico, 平山笑美, 近藤唯, 角元明日香, 南早紀, 渡部恵子, 諏訪彩花, 末柄里恵, 原嶋あかり, 伊藤美来, 野村香菜子, 麻倉もも, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 渡部優衣, 郁原ゆう
9thLIVE ChoruSp@rkle!!	DAY1	2023/1/14	31	Thank You! -MR MIX-		Machico, 平山笑美, 近藤唯, 角元明日香, 南早紀, 渡部恵子, 諏訪彩花, 末柄里恵, 原嶋あかり, 伊藤美来, 野村香菜子, 麻倉もも, 浜崎奈々, 桐谷蝶々, 夏川椎菜, 渡部優衣, 郁原ゆう
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	1	夢にかけるRainbow		山崎はるか, 田所あずさ, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 大関英里, 駒形友梨, 小岩井ことり, 藤井ゆきよ, 斉藤佑圭, 小笠原早紀, 髙橋ミナミ, 阿部里果, 木戸衣吹, 中村温姫
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	2	Flooding	ChoruSp@rkle!! MIX	小岩井ことり, 藤井ゆきよ, 阿部里果, 髙橋ミナミ
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	3	Play GO! Round		稲川英里
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	4	K・A・W・A・I・I of the WORLD!		小笠原早紀
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	5	あたためますか？		大関英里
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	6	グローインミュージック！		木戸衣吹
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	7	Eternal Harmony	ChoruSp@rkle!! MIX	駒形友梨, 斉藤佑圭, 山崎はるか, 小笠原早紀
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	8	Contrastet		香里有佐
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	9	ハッピーマイガーデン		田村奈央
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	10	REACH THE SKY		駒形友梨
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	11	パーフェクトゲーム		斉藤佑圭
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	12	Growing Storm!	ChoruSp@rkle!! MIX	中村温姫, 田所あずさ, 稲川英里, 大関英里, 田村奈央
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	13	プリムラ	ChoruSp@rkle!! MIX	雨宮天, 香里有佐, 木戸衣吹
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	14	わたしルネサンス		中村温姫
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	15	it's me		髙橋ミナミ
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	16	ゆえに…なんです		阿部里果
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	17	Purple Sky		雨宮天
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	18	ダイヤモンド・クラリティ		藤井ゆきよ, 山崎はるか, 香里有佐
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	19	Shamrock Vivace		阿部里果, 田村奈央, 稲川英里, 髙橋ミナミ, 中村温姫
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	20	空色♡ Birthday Card		駒形友梨, 小岩井ことり, 大関英里, 木戸衣吹
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	21	ESPADA		小笠原早紀, 田所あずさ, 雨宮天, 斉藤佑圭
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	22	週末だけのハーレクイン		山口立花子
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	23	Beautiful Believer		藤井ゆきよ
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	24	Moonrise Belief		小岩井ことり
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	25	Cross the future		田所あずさ
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	26	しあわせエンドロール		山崎はるか
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	27	花ざかりWeekend✿	ChoruSp@rkle!! MIX	大関英里, 木戸衣吹, 駒形友梨, 中村温姫, 斉藤佑圭, 小笠原早紀, 稲川英里
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	28	LEADER!!	ChoruSp@rkle!! MIX	小岩井ことり, 田村奈央, 山崎はるか, 香里有佐, 藤井ゆきよ, 田所あずさ, 髙橋ミナミ, 阿部里果, 雨宮天
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	29	DIAMOND DAYS	ChoruSp@rkle!! MIX	山崎はるか, 田所あずさ, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 大関英里, 駒形友梨, 小岩井ことり, 藤井ゆきよ, 斉藤佑圭, 小笠原早紀, 髙橋ミナミ, 阿部里果, 木戸衣吹, 中村温姫
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	30	セブンカウント		山崎はるか, 田所あずさ, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 大関英里, 駒形友梨, 小岩井ことり, 藤井ゆきよ, 斉藤佑圭, 小笠原早紀, 髙橋ミナミ, 阿部里果, 木戸衣吹, 中村温姫, 山口立花子
9thLIVE ChoruSp@rkle!!	DAY2	2023/1/15	31	Thank You!	MR MIX	山崎はるか, 田所あずさ, 稲川英里, 雨宮天, 田村奈央, 香里有佐, 大関英里, 駒形友梨, 小岩井ことり, 藤井ゆきよ, 斉藤佑圭, 小笠原早紀, 髙橋ミナミ, 阿部里果, 木戸衣吹, 中村温姫, 山口立花子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	1	Thank You!		山崎はるか, 小笠原早紀, 角元明日香, 郁原ゆう, 斉藤佑圭, 末柄里恵, 種田梨沙, 中村温姫, 夏川椎菜, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 渡部恵子, 渡部優衣
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	2	素敵なキセキ		山崎はるか
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	3	ハッピー☆ラッキー☆ジェットマシーン		渡部優衣
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	4	Heart♡・デイズ・Night☆		小笠原早紀
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	5	IMPRESSION→LOCOMOTION!		中村温姫
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	6	MY STYLE! OUR STYLE!!!!		渡部恵子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	7	求ム VS マイ・フューチャー		浜崎奈々
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	8	Eternal Harmony		山崎はるか, 角元明日香, 郁原ゆう, 末柄里恵, 小笠原早紀, 平山笑美, 夏川椎菜
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	9	Blue Symphony		藤井ゆきよ, 野村香菜子, 種田梨沙, 郁原ゆう, 斉藤佑圭, 平山笑美
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	10	bitter sweet		末柄里恵
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	11	Day After "Yesterday"		斉藤佑圭
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	12	サマ☆トリ 〜Summer trip〜		平山笑美
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	13	HOME, SWEET FRIENDSHIP		浜崎奈々, 渡部優衣, 渡部恵子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	14	リフレインキス		藤井ゆきよ, 種田梨沙, 角元明日香
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	15	恋の音色ライン		野村香菜子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	16	想いはCarnaval		角元明日香
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	17	君だけの欠片		郁原ゆう
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	18	ホントウノワタシ		種田梨沙
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	19	ココロがかえる場所		野村香菜子, 渡部恵子, 中村温姫
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	20	Dreamscape		浜崎奈々, 斉藤佑圭
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	21	VIVID イマジネーション		夏川椎菜
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	22	アフタースクールパーリータイム		藤井ゆきよ
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	23	fruity love		小笠原早紀, 中村温姫
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	24	PRETTY DREAMER		末柄里恵, 渡部優衣, 夏川椎菜, 山崎はるか
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	25	Shooting Stars		藤井ゆきよ, 小笠原早紀, 平山笑美, 斉藤佑圭
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	26	STANDING ALIVE		種田梨沙, 中村温姫, 角元明日香, 浜崎奈々, 末柄里恵
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	27	U・N・M・E・I ライブ		渡部恵子, 野村香菜子, 山崎はるか, 夏川椎菜, 郁原ゆう, 渡部優衣
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	28	Dreaming!		山崎はるか, 小笠原早紀, 角元明日香, 郁原ゆう, 斉藤佑圭, 末柄里恵, 種田梨沙, 中村温姫, 夏川椎菜, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 渡部恵子, 渡部優衣
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	29	Crossing!		山崎はるか, 小笠原早紀, 角元明日香, 郁原ゆう, 斉藤佑圭, 末柄里恵, 種田梨沙, 中村温姫, 夏川椎菜, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 渡部恵子, 渡部優衣
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY1	2023/4/22	30	Thank You!		山崎はるか, 小笠原早紀, 角元明日香, 郁原ゆう, 斉藤佑圭, 末柄里恵, 種田梨沙, 中村温姫, 夏川椎菜, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 渡部恵子, 渡部優衣
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	1	Thank You!		Machico, 愛美, 麻倉もも, 阿部里果, 稲川英里, 大関英里, 木戸衣吹, 桐谷蝶々, 小岩井ことり, 駒形友梨, 近藤唯, 諏訪彩花, 髙橋ミナミ, 原嶋あかり, 山口立花子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	2	ドリームトラベラー		麻倉もも, 大関英里, 髙橋ミナミ, 原嶋あかり, 稲川英里
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	3	POKER POKER		阿部里果
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	4	君想いBirthday		駒形友梨
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	5	ハッピ〜 エフェクト！		桐谷蝶々
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	6	グッデイ・サンシャイン！		原嶋あかり
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	7	スマイルいちばん		大関英里
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	8	ジャングル☆パーティー		近藤唯, 諏訪彩花, Machico, 稲川英里, 髙橋ミナミ, 駒形友梨, 木戸衣吹, 山口立花子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	9	P.S I Love You		愛美, 髙橋ミナミ, 近藤唯, 小岩井ことり, 阿部里果, 山口立花子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	10	Good-Sleep, Baby♡		木戸衣吹, 原嶋あかり, 稲川英里
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	11	Smiling Crescent		麻倉もも, 桐谷蝶々
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	12	Melody in scape		大関英里, 駒形友梨
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	13	合言葉はスタートアップ！		諏訪彩花, 桐谷蝶々, 小岩井ことり
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	14	HELLO, YOUR ANGEL♪		原嶋あかり, 小岩井ことり
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	15	Be My Boy		山口立花子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	16	水中キャンディ		髙橋ミナミ
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	17	オリジナル声になって		木戸衣吹
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	18	ちいさな恋の足音		近藤唯
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	19	たしかな足跡		阿部里果, 麻倉もも, 山口立花子, Machico, 大関英里, 木戸衣吹
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	20	瞳の中のシリウス		愛美, 駒形友梨, 諏訪彩花, 桐谷蝶々, 近藤唯
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	21	トキメキの音符になって		麻倉もも
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	22	カーニヴァル・ジャパネスク		諏訪彩花
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	23	BOUNCING♪ SMILE!		稲川英里
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	24	Maria Trap		小岩井ことり
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	25	Believe my change!		Machico
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	26	プラリネ		愛美
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	27	アイル		阿部里果, Machico, 愛美
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	28	Dreaming!		Machico, 愛美, 麻倉もも, 阿部里果, 稲川英里, 大関英里, 木戸衣吹, 桐谷蝶々, 小岩井ことり, 駒形友梨, 近藤唯, 諏訪彩花, 髙橋ミナミ, 原嶋あかり, 山口立花子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	29	Crossing!		Machico, 愛美, 麻倉もも, 阿部里果, 稲川英里, 大関英里, 木戸衣吹, 桐谷蝶々, 小岩井ことり, 駒形友梨, 近藤唯, 諏訪彩花, 髙橋ミナミ, 原嶋あかり, 山口立花子
10thLIVE TOUR Act-1 H@PPY 4 YOU!	DAY2	2023/4/23	30	Thank You!		Machico, 愛美, 麻倉もも, 阿部里果, 稲川英里, 大関英里, 木戸衣吹, 桐谷蝶々, 小岩井ことり, 駒形友梨, 近藤唯, 諏訪彩花, 髙橋ミナミ, 原嶋あかり, 山口立花子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	1	Brand New Theater!		山崎はるか, 阿部里果, 雨宮天, 小笠原早紀, 角元明日香, 木戸衣吹, 駒形友梨, 末柄里恵, 田村奈央, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 南早紀, 渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	2	未来系ドリーマー		山崎はるか
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	3	Hearty!!		藤井ゆきよ
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	4	シャクネツのパレード		角元明日香
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	5	グローインミュージック！		木戸衣吹
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	6	WE ARE ONE!!		浜崎奈々
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	7	Black★Party		小笠原早紀, 平山笑美
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	8	ムーンゴールド		野村香菜子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	9	スノウレター		田村奈央
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	10	祈りの羽根		末柄里恵
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	11	ふたり繋ぐ星座		平山笑美
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	12	Melty Fantasia		南早紀, 阿部里果, 雨宮天
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	13	AIKANE?		小笠原早紀
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	14	リーチ・アップ・ステップ！		渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	15	ゆえに…なんです		阿部里果
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	16	さかしまの言葉		南早紀
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	17	REACH THE SKY		駒形友梨
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	18	CAT CROSSING		雨宮天
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	19	Angelic Parade♪	ショートver.	小笠原早紀, 田村奈央, 末柄里恵, 角元明日香, 平山笑美
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	20	Princess Be Ambitious!!	ショートver.	浜崎奈々, 木戸衣吹, 山崎はるか, 駒形友梨
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	21	FairyTaleじゃいられない	ショートver.	渡部恵子, 雨宮天, 阿部里果, 野村香菜子, 南早紀, 藤井ゆきよ
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	22	Do the IDOL!! 〜断崖絶壁チュパカブラ〜		山崎はるか, 阿部里果, 雨宮天, 小笠原早紀, 角元明日香, 木戸衣吹, 駒形友梨, 末柄里恵, 田村奈央, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 南早紀, 渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	23	Episode. Tiara		小笠原早紀, 田村奈央, 藤井ゆきよ, 駒形友梨
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	24	Cherry Colored Love		末柄里恵, 野村香菜子, 阿部里果, 南早紀
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	25	ReTale		平山笑美, 角元明日香, 浜崎奈々
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	26	ZETTAI×BREAK!! トゥインクルリズム		山崎はるか, 渡部恵子, 木戸衣吹, 雨宮天
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	27	Do the IDOL!! 〜断崖絶壁チュパカブラ〜		山崎はるか, 阿部里果, 雨宮天, 小笠原早紀, 角元明日香, 木戸衣吹, 駒形友梨, 末柄里恵, 田村奈央, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 南早紀, 渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	28	Glow Map		山崎はるか, 阿部里果, 雨宮天, 小笠原早紀, 角元明日香, 木戸衣吹, 駒形友梨, 末柄里恵, 田村奈央, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 南早紀, 渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	29	Crossing!		山崎はるか, 阿部里果, 雨宮天, 小笠原早紀, 角元明日香, 木戸衣吹, 駒形友梨, 末柄里恵, 田村奈央, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 南早紀, 渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	30	グッドサイン		山崎はるか, 阿部里果, 雨宮天, 小笠原早紀, 角元明日香, 木戸衣吹, 駒形友梨, 末柄里恵, 田村奈央, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 南早紀, 渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY1	2023/7/29	31	Thank You!		山崎はるか, 阿部里果, 雨宮天, 小笠原早紀, 角元明日香, 木戸衣吹, 駒形友梨, 末柄里恵, 田村奈央, 野村香菜子, 浜崎奈々, 平山笑美, 藤井ゆきよ, 南早紀, 渡部恵子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	1	Brand New Theater!		田所あずさ, Machico, 愛美, 伊藤美来, 大関英里, 郁原ゆう, 桐谷蝶々, 小岩井ことり, 香里有佐, 近藤唯, 中村温姫, 原嶋あかり, 山口立花子, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	2	ART NEEDS HEART BEATS		中村温姫
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	3	ふわりずむ		桐谷蝶々
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	4	週末だけのハーレクイン		山口立花子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	5	Super Duper		大関英里, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	6	アロー彗星		愛美
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	7	恋のWa・Wo・N		伊藤美来
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	8	勇気のfragrance		近藤唯
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	9	Angelic Parade♪	ショートver.	近藤唯, Machico, 香里有佐, 桐谷蝶々
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	10	Princess Be Ambitious!!	ショートver.	大関英里, 伊藤美来, 郁原ゆう, 原嶋あかり, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	11	FairyTaleじゃいられない	ショートver.	小岩井ことり, 中村温姫, 田所あずさ, 愛美, 山口立花子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	12	ときどきシーソー		原嶋あかり
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	13	満腹至極フルコォス		大関英里
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	14	MUSIC JOURNEY		香里有佐
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	15	Do the IDOL!! 〜断崖絶壁チュパカブラ〜		田所あずさ, Machico, 愛美, 伊藤美来, 大関英里, 郁原ゆう, 桐谷蝶々, 小岩井ことり, 香里有佐, 近藤唯, 中村温姫, 原嶋あかり, 山口立花子, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	16	ピコピコIIKO！インベーダー		大関英里, 香里有佐, 小岩井ことり
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	17	月曜日のクリームソーダ		Machico, 近藤唯, 原嶋あかり, 桐谷蝶々
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	18	Parade d'amour		伊藤美来, 愛美, 田所あずさ, 中村温姫
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	19	絶対的Performer		渡部優衣, 山口立花子
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	20	Do the IDOL!! 〜断崖絶壁チュパカブラ〜		田所あずさ, Machico, 愛美, 伊藤美来, 大関英里, 郁原ゆう, 桐谷蝶々, 小岩井ことり, 香里有佐, 近藤唯, 中村温姫, 原嶋あかり, 山口立花子, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	21	ハーモニクス		田所あずさ, 愛美
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	22	稲妻スピリット		渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	23	Sister		小岩井ことり
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	24	はなしらべ		郁原ゆう
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	25	泣き空、のち		Machico
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	26	SING MY SONG		田所あずさ
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	27	Flyers!!!		田所あずさ, Machico, 愛美, 伊藤美来, 大関英里, 郁原ゆう, 桐谷蝶々, 小岩井ことり, 香里有佐, 近藤唯, 中村温姫, 原嶋あかり, 山口立花子, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	28	Crossing!		田所あずさ, Machico, 愛美, 伊藤美来, 大関英里, 郁原ゆう, 桐谷蝶々, 小岩井ことり, 香里有佐, 近藤唯, 中村温姫, 原嶋あかり, 山口立花子, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	29	グッドサイン		田所あずさ, Machico, 愛美, 伊藤美来, 大関英里, 郁原ゆう, 桐谷蝶々, 小岩井ことり, 香里有佐, 近藤唯, 中村温姫, 原嶋あかり, 山口立花子, 渡部優衣
10thLIVE TOUR Act-2 5 TO SP@RKLE!!	DAY2	2023/7/30	30	Thank You!		田所あずさ, Machico, 愛美, 伊藤美来, 大関英里, 郁原ゆう, 桐谷蝶々, 小岩井ことり, 香里有佐, 近藤唯, 中村温姫, 原嶋あかり, 山口立花子, 渡部優衣
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	1	Rat A Tat!!!		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	2	ToP!!!!!!!!!!!!!		田所あずさ, 山崎はるか
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	3	We Have A Dream		木戸衣吹, 原嶋あかり, 南早紀, 香里有佐, 小笠原早紀, 中村温姫, 浜崎奈々
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	4	Star Impression		大関英里, 小岩井ことり
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	5	CHANGE!!!!		浜崎奈々, 木戸衣吹, 原嶋あかり, 愛美, 小笠原早紀, 髙橋ミナミ, 桐谷蝶々, 平山笑美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	6	海風とカスタネット		阿部里果, 浜崎奈々, 山口立花子
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	7	catch my feeling		中村温姫, 渡部優衣, 髙橋ミナミ, 渡部恵子, 野村香菜子
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	8	迷走Mind		大関英里, Machico, 木戸衣吹, 小岩井ことり, 愛美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	9	arcadia		浜崎奈々, 阿部里果, 田所あずさ, 山口立花子, 平山笑美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	10	チョー↑元気Show☆アイドルch@ng!		桐谷蝶々, 駒形友梨, 小笠原早紀, 原嶋あかり, 中村温姫, 野村香菜子, 髙橋ミナミ, 渡部恵子, 渡部優衣
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	11	ハミングバード		香里有佐
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	12	バトンタッチ		原嶋あかり, 駒形友梨, 桐谷蝶々, 小笠原早紀
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	13	Sentimental Venus		渡部優衣, 阿部里果, 山口立花子
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	14	SMOKY THRILL		田所あずさ, 山崎はるか, Machico
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	15	ALRIGHT*		駒形友梨, 桐谷蝶々, 南早紀, 阿部里果, 渡部優衣
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	16	READY!!		大関英里, 駒形友梨, 山崎はるか, 小岩井ことり, 中村温姫, 野村香菜子, 山口立花子, 渡部恵子
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	17	マリオネットの心		平山笑美, Machico, 愛美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	18	瑠璃色金魚と花菖蒲		南早紀
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	19	my song		髙橋ミナミ, 野村香菜子, 大関英里, 田所あずさ, 渡部恵子, 香里有佐, 小岩井ことり
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	20	トワラー		木戸衣吹, 愛美, 平山笑美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	21	REFRAIN REL@TION		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	22	Thank You!		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY1	2023/11/4	23	M@STERPIECE		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	1	Rat A Tat!!!		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	2	ロケットスター☆		Machico
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	3	We Have A Dream		木戸衣吹, 原嶋あかり, 南早紀, 香里有佐, 小笠原早紀, 中村温姫, 浜崎奈々
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	4	Star Impression		大関英里, 小岩井ことり
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	5	CHANGE!!!!		浜崎奈々, 木戸衣吹, 原嶋あかり, 愛美, 小笠原早紀, 髙橋ミナミ, 桐谷蝶々, 平山笑美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	6	my song		髙橋ミナミ, 野村香菜子, 大関英里, 田所あずさ, 渡部恵子, 香里有佐, 小岩井ことり
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	7	海風とカスタネット		阿部里果, 浜崎奈々, 山口立花子
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	8	マリオネットの心		平山笑美, Machico, 愛美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	9	catch my feeling		中村温姫, 渡部優衣, 髙橋ミナミ, 渡部恵子, 野村香菜子
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	10	フェスタ・イルミネーション		山口立花子, 大関英里, 木戸衣吹, 阿部里果, 小岩井ことり, 平山笑美, Machico, 浜崎奈々
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	11	バトンタッチ		原嶋あかり, 駒形友梨, 桐谷蝶々, 小笠原早紀
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	12	Sentimental Venus		渡部優衣, 阿部里果, 山口立花子, 会場のプロデューサー
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	13	SMOKY THRILL		田所あずさ, 山崎はるか, Machico
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	14	ALRIGHT*		駒形友梨, 桐谷蝶々, 南早紀, 阿部里果, 渡部優衣
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	15	READY!!		大関英里, 駒形友梨, 山崎はるか, 小岩井ことり, 中村温姫, 野村香菜子, 山口立花子, 渡部恵子
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	16	エージェント夜を往く		小笠原早紀, 香里有佐, 原嶋あかり, 髙橋ミナミ, 桐谷蝶々, 渡部優衣
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	17	Next Life		南早紀, 野村香菜子, 中村温姫, 渡部恵子, 駒形友梨, 山崎はるか
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	18	トワラー		木戸衣吹, 愛美, 平山笑美
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	19	Gift Sign		田所あずさ
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	20	REFRAIN REL@TION		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	21	Brand New Theater!		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	22	M@STERPIECE		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-3 R@ISE THE DREAM!!!	DAY2	2023/11/5	23	Thank You!		山崎はるか, 田所あずさ, Machico, 平山笑美, 香里有佐, 大関英里, 愛美, 南早紀, 渡部恵子, 駒形友梨, 小岩井ことり, 原嶋あかり, 野村香菜子, 小笠原早紀, 髙橋ミナミ, 浜崎奈々, 阿部里果, 桐谷蝶々, 山口立花子, 木戸衣吹, 渡部優衣, 中村温姫
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	1	Welcome!!		山崎はるかMachico角元明日香大関英里藤井ゆきよ麻倉もも小笠原早紀夏川椎菜中村温姫伊藤美来駒形友梨原嶋あかり小岩井ことり郁原ゆう雨宮天田村奈央木戸衣吹渡部優衣野村香菜子稲川英里末柄里恵桐谷蝶々浜崎奈々阿部里果近藤唯山口立花子斉藤佑圭平山笑美渡部恵子愛美南早紀香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	2	Legend Girls!!		伊藤美来, 麻倉もも, 小岩井ことり
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	3	AIKANE?		小笠原早紀
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	4	FIND YOUR WIND!		平山笑美
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	5	Only One Second		駒形友梨
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	6	SUPER SIZE LOVE!!		大関英里
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	7	ゲキテキ！ムテキ！恋したい！		レオ (中村温姫, 原嶋あかり, 角元明日香)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	8	ショコラブル*イブ		駒形友梨, 山崎はるか, 藤井ゆきよ, 夏川椎菜, 小笠原早紀
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	9	花びらメモリーズ		藤井ゆきよ, 大関英里, 南早紀, 渡部恵子
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	10	スペードのQ		郁原ゆう, 斉藤佑圭, 雨宮天
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	11	Border LINE→→→♡		山口立花子
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	12	オレンジの空の下		末柄里恵
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	13	STEREOPHONIC ISOTONIC		中村温姫
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	14	マイペース☆マイウェイ		浜崎奈々
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	15	おまじない		木戸衣吹
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	16	旅立ちのコンパス		Fleuranges (田村奈央, 麻倉もも, 近藤唯, 桐谷蝶々)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	17	Harmony 4 You		伊藤美来, 香里有佐, 小岩井ことり
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	18	CHEER UP! HEARTS UP!		愛美, 木戸衣吹, 夏川椎菜
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	19	夢みがちBride		桐谷蝶々, 阿部里果, 渡部優衣
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	20	絵羽模様		郁原ゆう
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	21	あのね、聞いてほしいことがあるんだ		田村奈央
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	22	アニマル☆ステイション！		原嶋あかり
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	23	たんけんぼうけん☆ハイホー隊		稲川英里
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	24	流星群		愛美
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	25	昏き星、遠い月		夜想令嬢 -GRAC&E NOCTURNE- (藤井ゆきよ, 小岩井ことり, 山口立花子, 野村香菜子)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	26	dans l'obscurité		Chrono-Lexica (阿部里果, 夏川椎菜, 伊藤美来, 斉藤佑圭, 中村温姫)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	27	きまぐれユモレスク		麻倉もも
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	28	ローリング△さんかく		渡部恵子
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	29	ライアー・ルージュ		雨宮天
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	30	透明なプロローグ		伊藤美来
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	31	Super Lover		渡部優衣
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	32	矛盾の月		花咲夜 (小岩井ことり, 郁原ゆう, 南早紀)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	33	カワラナイモノ		駒形友梨, 浜崎奈々, 近藤唯
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	34	カンパリーナ♡		平山笑美, 野村香菜子, 末柄里恵
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	35	クルリウタ		野村香菜子, 角元明日香, 小笠原早紀, 香里有佐, 雨宮天
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	36	赤い世界が消える頃		近藤唯, 阿部里果, 木戸衣吹, 大関英里, 平山笑美
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	37	DIAMOND JOKER		Machico, 藤井ゆきよ
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	38	電波感傷		オフィウクス (南早紀, 香里有佐)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	39	Marionetteは眠らない		平山笑美, Machico, 愛美
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	40	シークレットジュエル 〜魅惑の金剛石〜		香里有佐, 渡部恵子, 桐谷蝶々, 山崎はるか
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	41	Shamrock Vivace		CLEVER CLOVER (中村温姫, 野村香菜子, 田村奈央, 阿部里果, 角元明日香, 渡部優衣)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	42	EVERYDAY STARS!!		山崎はるか, Machico, 角元明日香, 大関英里, 藤井ゆきよ, 麻倉もも, 小笠原早紀, 夏川椎菜, 中村温姫, 伊藤美来, 駒形友梨, 原嶋あかり, 小岩井ことり, 郁原ゆう, 雨宮天, 田村奈央, 木戸衣吹, 渡部優衣, 野村香菜子, 稲川英里, 末柄里恵, 桐谷蝶々, 浜崎奈々, 阿部里果, 近藤唯, 山口立花子, 斉藤佑圭, 平山笑美, 渡部恵子, 愛美, 南早紀, 香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	43	Crossing!		山崎はるか, Machico, 角元明日香, 大関英里, 藤井ゆきよ, 麻倉もも, 小笠原早紀, 夏川椎菜, 中村温姫, 伊藤美来, 駒形友梨, 原嶋あかり, 小岩井ことり, 郁原ゆう, 雨宮天, 田村奈央, 木戸衣吹, 渡部優衣, 野村香菜子, 稲川英里, 末柄里恵, 桐谷蝶々, 浜崎奈々, 阿部里果, 近藤唯, 山口立花子, 斉藤佑圭, 平山笑美, 渡部恵子, 愛美, 南早紀, 香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY1	2024/2/24	44	Rat A Tat!!!		山崎はるか, Machico, 角元明日香, 大関英里, 藤井ゆきよ, 麻倉もも, 小笠原早紀, 夏川椎菜, 中村温姫, 伊藤美来, 駒形友梨, 原嶋あかり, 小岩井ことり, 郁原ゆう, 雨宮天, 田村奈央, 木戸衣吹, 渡部優衣, 野村香菜子, 稲川英里, 末柄里恵, 桐谷蝶々, 浜崎奈々, 阿部里果, 近藤唯, 山口立花子, 斉藤佑圭, 平山笑美, 渡部恵子, 愛美, 南早紀, 香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	1	Rat A Tat!!!		山崎はるか, 田所あずさ, Machico, 種田梨沙, 角元明日香, 大関英里, 藤井ゆきよ, 諏訪彩花, 麻倉もも, 小笠原早紀, 夏川椎菜, 中村温姫, 伊藤美来, 駒形友梨, 村川梨衣, 上田麗奈, 原嶋あかり, 小岩井ことり, 郁原ゆう, 雨宮天, 田村奈央, 木戸衣吹, 渡部優衣, 野村香菜子, 髙橋ミナミ, 稲川英里, 末柄里恵, 桐谷蝶々, 浜崎奈々, 阿部里果, 近藤唯, 山口立花子, 斉藤佑圭, 平山笑美, 渡部恵子, 愛美, 南早紀, 香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	2	サウンド・オブ・ビギニング		RisingLight (渡部恵子, 中村温姫, 種田梨沙, 野村香菜子, 桐谷蝶々)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	3	Star Impression		Team1st (夏川椎菜, 大関英里, 雨宮天, 小岩井ことり)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	4	フェスタ・イルミネーション		諏訪彩花
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	5	ファンタジスタ・カーニバル		角元明日香
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	6	ユニゾン☆ビート		戸田めぐみ
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	7	MUSIC JOURNEY		香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	8	海風とカスタネット		Team2nd (近藤唯, 阿部里果, 上田麗奈, 浜崎奈々, 山口立花子)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	9	オレンジノキオク		Team3rd (末柄里恵, 藤井ゆきよ, 種田梨沙, 稲川英里, 伊藤美来)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	10	ABSOLUTE RUN!!!		ストロベリーポップムーン (Machico, 山崎はるか, 田所あずさ)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	11	catch my feeling		Team4th (中村温姫, 渡部優衣, 髙橋ミナミ, 渡部恵子, 村川梨衣, 野村香菜子)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	12	バトンタッチ		Team5th (小笠原早紀, 桐谷蝶々, 駒形友梨, 麻倉もも, 原嶋あかり)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	13	恋愛ロードランナー		上田麗奈
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	14	パーフェクトゲーム		斉藤佑圭
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	15	フローズン・ワード		藤井ゆきよ
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	16	Sing a Wing Song		種田梨沙
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	17	花ざかりWeekend✿		4 Luxury (平山笑美, 香里有佐, 末柄里恵, 髙橋ミナミ)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	18	Unknown Boxの開き方		Team6th (斉藤佑圭, 角元明日香, 諏訪彩花, 郁原ゆう, 田村奈央)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	19	...In The Name Of。 ...LOVE?		阿部里果
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	20	教えてlast note…		近藤唯
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	21	初恋バタフライ		桐谷蝶々
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	22	恋心マスカレード		野村香菜子
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	23	dear...		髙橋ミナミ
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	24	トワラー		Team7th (木戸衣吹, 愛美, 戸田めぐみ, 平山笑美)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	25	わたしは花、あなたは太陽		FleurS (渡部恵子, 伊藤美来, 髙橋ミナミ)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	26	Dance in the Light		山口立花子, 駒形友梨, 戸田めぐみ, 斉藤佑圭
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	27	鳥籠スクリプチュア		小岩井ことり
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	28	瑠璃色金魚と花菖蒲		南早紀
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	29	Up!10sion♪Pleeeeeeeeease!		村川梨衣
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	30	Happy Darling		夏川椎菜
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	31	Clover Days		Clover (麻倉もも, 上田麗奈, 木戸衣吹, 雨宮天)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	32	REFRAIN REL@TION		Team8th (香里有佐, 田所あずさ, 山崎はるか, Machico, 南早紀)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	33	BORN ON DREAM! 〜HANABI☆NIGHT〜		閃光☆HANABI団 (大関英里, 渡部優衣, 駒形友梨, 上田麗奈, 浜崎奈々)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	34	深層マーメイド		田所あずさ, Machico
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	35	ESPADA		SHADE OF SPADE (南早紀, 近藤唯, 原嶋あかり, 末柄里恵, 小笠原早紀, 郁原ゆう, 斉藤佑圭)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	36	俠気乱舞		浜崎奈々, 稲川英里, 愛美, 渡部恵子, 田村奈央
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	37	Shooting Stars		クレシェンドブルー (雨宮天, 麻倉もも, 田所あずさ, 小笠原早紀, 平山笑美)
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	38	夢にかけるRainbow		種田梨沙, 愛美, 南早紀, 郁原ゆう, 山口立花子
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	39	恋のLesson初級編		Machico
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	40	Precious Grain		田所あずさ
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	41	未来飛行		山崎はるか
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	42	UNION!!		山崎はるか, 田所あずさ, Machico, 種田梨沙, 角元明日香, 大関英里, 藤井ゆきよ, 諏訪彩花, 麻倉もも, 小笠原早紀, 夏川椎菜, 中村温姫, 伊藤美来, 駒形友梨, 村川梨衣, 上田麗奈, 原嶋あかり, 小岩井ことり, 郁原ゆう, 雨宮天, 田村奈央, 木戸衣吹, 渡部優衣, 野村香菜子, 髙橋ミナミ, 稲川英里, 末柄里恵, 桐谷蝶々, 浜崎奈々, 阿部里果, 近藤唯, 山口立花子, 斉藤佑圭, 平山笑美, 渡部恵子, 愛美, 南早紀, 香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	43	Crossing!		山崎はるか, 田所あずさ, Machico, 種田梨沙, 角元明日香, 大関英里, 藤井ゆきよ, 諏訪彩花, 麻倉もも, 小笠原早紀, 夏川椎菜, 中村温姫, 伊藤美来, 駒形友梨, 村川梨衣, 上田麗奈, 原嶋あかり, 小岩井ことり, 郁原ゆう, 雨宮天, 田村奈央, 木戸衣吹, 渡部優衣, 野村香菜子, 髙橋ミナミ, 稲川英里, 末柄里恵, 桐谷蝶々, 浜崎奈々, 阿部里果, 近藤唯, 山口立花子, 斉藤佑圭, 平山笑美, 渡部恵子, 愛美, 南早紀, 香里有佐
10thLIVE TOUR Act-4 MILLION THE@TER!!!!	DAY2	2024/2/25	44	Thank You!		山崎はるか, 田所あずさ, Machico, 種田梨沙, 角元明日香, 大関英里, 藤井ゆきよ, 諏訪彩花, 麻倉もも, 小笠原早紀, 夏川椎菜, 中村温姫, 伊藤美来, 駒形友梨, 村川梨衣, 上田麗奈, 原嶋あかり, 小岩井ことり, 郁原ゆう, 雨宮天, 戸田めぐみ, 田村奈央, 木戸衣吹, 渡部優衣, 野村香菜子, 髙橋ミナミ, 稲川英里, 末柄里恵, 桐谷蝶々, 浜崎奈々, 阿部里果, 近藤唯, 山口立花子, 斉藤佑圭, 平山笑美, 渡部恵子, 愛美, 南早紀, 香里有佐
`;
const cv_data = `
中村繪里子	#e22b30	天海春香
今井麻美	#2743d2	如月千早
長谷川明子	#b4e04b	星井美希
浅倉杏美	#d3dde9	萩原雪歩
仁後真耶子	#f39939	高槻やよい
平田宏美	#515558	菊地真
釘宮理恵	#fd99e1	水瀬伊織
原由実	#a6126a	四条貴音
若林直美	#01a860	秋月律子
たかはし智秋	#9238be	三浦あずさ
下田麻美	#ffe43f	双海亜美、双海真美
沼倉愛美	#01adb9	我那覇響
山崎はるか	#ea5b76	春日未来
田所あずさ	#6495cf	最上静香
Machico	#fed552	伊吹翼
種田梨沙	#92cfbb	田中琴葉
角元明日香	#9bce92	島原エレナ
大関英里	#58a6dc	佐竹美奈子
藤井ゆきよ	#454341	所恵美
諏訪彩花	#5abfb7	徳川まつり
麻倉もも	#ed90ba	箱崎星梨花
小笠原早紀	#eb613f	野々原茜
夏川椎菜	#7e6ca8	望月杏奈
中村温姫	#fff03c	ロコ
伊藤美来	#c7b83c	七尾百合子
駒形友梨	#7f6575	高山紗代子
村川梨衣	#b54461	松田亜利沙
上田麗奈	#e9739b	高坂海美
原嶋あかり	#f7e78e	中谷育
小岩井ことり	#bee3e3	天空橋朋花
郁原ゆう	#554171	エミリー
雨宮天	#afa690	北沢志保
戸田めぐみ	#e25a9b	舞浜歩
田村奈央	#d1342c	木下ひなた
木戸衣吹	#f5ad3b	矢吹可奈
渡部優衣	#788bc5	横山奈緒
野村香菜子	#f19557	二階堂千鶴
髙橋ミナミ	#f1becb	馬場このみ
稲川英里	#ee762e	大神環
末柄里恵	#7278a8	豊川風花
桐谷蝶々	#d7a96b	宮尾美也
浜崎奈々	#eceb70	福田のり子
阿部里果	#99b7dc	真壁瑞希
近藤唯	#b63b40	篠宮可憐
山口立花子	#f19591	百瀬莉緒
斉藤佑圭	#aeb49c	永吉昴
平山笑美	#6bb6b0	北上麗花
渡部恵子	#efb864	周防桃子
愛美	#d7385f	ジュリア
南早紀	#ebe1ff	白石紬
香里有佐	#274079	桜守歌織
`;
init();
