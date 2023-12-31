# CSV Comparator

[CSV Comparator](https://nishihara-daiki.github.io/csv-comparator/) は、2つのCSVファイルを行単位で比較するツールです。

ローカルのブラウザ内で動作するため、ファイルは外部に送信されません。



## 使用例

例として、次の2つのファイルを使用します。

[a.csv](materials/a.csv) [[download](https://nishihara-daiki.github.io/csv-comparator/materials/a.csv)]（ヘッダ1行）
```csv
ITEM_CODE,SECTION_ID,APRIL,MAY,JUNE
102500,230,1000,1080,1090
102500,260,2000,1090,4590
102600,230,2600,1090,4590
102700,230,5000,5020,6070
102700,260,5700,4900,4900
```

[b.csv](materials/b.csv) [[download](https://nishihara-daiki.github.io/csv-comparator/materials/b.csv)]（ヘッダ2行）
```csv
商品コード,セクションID,4月,5月,6月
ITEM_CODE,SECTION_ID,APRIL,MAY,JUNE
102500,230,1000,1080,1090
102500,260,2000,1090,4590
102600,230,2600,1090,4690
102700,230,5000,5020,6070
102800,230,5020,5100,4090
```

### 0. テンプレート

ここでは、事前に保存した設定の再利用や、入力済みの設定を保存できます。テンプレートを使用せず初めて使う場合は、読み飛ばして次項へ進みます。

詳細な使い方は、後述の仕様（全ての機能）を参照してください。


### 1. ファイルを選択

まず、使用する文字コードを設定します。比較する2つのCSVファイルで共通の設定です。

![](./materials/1-1.png)


ファイル1をアップロードします。

1. 「ファイルを選択」から `a.csv` を選択します。
1. 自動で、プレビュー画面に読み込まれます。
1. 「名前」は自動的にファイル名の `a` が入力されますが、好きな名前に変更可能です。
1. ヘッダ行数を指定します。今回は `1` です。

アップロード前の図

![fig1](./materials/1-2.png)


ファイル2も同様です。ただし、`b.csv` はヘッダが2行あるため、「ヘッダ行数」は `2` とします。

アップロード後の図

![fig2](./materials/1-3.png)



### 2. カラム設計

比較する行を定義します。

例では、0列目の `ITEM_CODE`、1列目の `SECTION_ID` の列をキーとして2つのファイルを比較します。（列数は0から数えます）

比較対象は 2列目の `APRIL`、3列目の `MAY`、4列目の `JUNE` です。


1. カラム数を増やします。「増やす」ボタンを2回クリックして、3列にします。
1. 「ファイル1」の行から埋めていきます。キーボードで `#0`、`#1`、... と入力しても構いませんが（※図では `#0(ITEM_CODE)` としていますが、単に `#0` としても構いません）、入力欄をクリックするとサジェスト表示されるので、クリック操作での入力もできます。「ファイル1」行の3つ目は、`#2(APRIL)-#4(JUNE)`（もしくは `#2-#4`）と入力しています。これは、2列目から4列目を表しています（カラム数を増やして個別に、`#2`、`#3`、`#4` と入力しても構いません）。
![](./materials/2-1.png)
1. 「ファイル2」の行を埋めます。「おまかせ」ボタンを押すと、ファイル1とファイル2のヘッダを見比べて自動で補完されます。
1. 「種別」の行を埋めます。図のように、「キー」「キー」「比較」を選択します。
![](./materials/2-2.png)
1. 「出力ヘッダ」の行を埋めます。「おまかせ」ボタンを押すと、ファイル2のヘッダ情報を見て自動で補完されます。

![](./materials/2-3.png)


### 3. 実行

「比較実行」ボタンを押すと、比較結果が表示されます。
![](./materials/3-1.png)

* 白い部分は、変化がないことを示しています。
* 緑色は追加、赤色は削除を示しています。例えば、`JUNE`列の中央行付近では、`a` の `4590` が、`b` の `4690` に変わっていることを示しています。
* 行全体が赤の部分は、`a`のみにキーが存在することを示しています。
* 行全体が緑の部分は、`b`のみにキーが存在することを示しています。



## 仕様（全ての機能）

各項目ごとに仕様を説明します。


### 0. テンプレート

#### テンプレートの読み込み

事前に保存したテンプレート（.jsonファイル）を読み込みします。

テンプレートファイルを選択し、「読み込み」ボタンを押すとテンプレートの内容が反映（上書き）されます。
読み込む内容は次のチェックボックスで選択できます。
* ファイル選択（フィルタ）：チェックすると、ファイル選択のフィルタ情報を読み込みします。
* カラム設計：チェックすると、カラム設計の表を読み込みします。


#### テンプレートの保存

「入力中の設定をダウンロード」ボタンを押すと、次項以降の「ファイルを選択（フィルタのみ）」「カラム設計」の内容を含んだファイル `template.json` をダウンロードできます。

テンプレートファイルの書式は、後述しています。


### 1. ファイル選択

#### 文字コード

文字コードは `Shift_JIS` または `UTF-8` を選択できます。文字コードは、比較するCSVファイルや設計JSONファイルで共通である必要があります。


#### [ファイル1, ファイル2] > ファイルを選択

比較するファイルを選択します。「ファイルを選択」ボタンでファイルを選択するか、ファイルを直接ドラッグ＆ドロップして指定します。


#### [ファイル1, ファイル2] > 名前

最終的な比較結果で使用されます。
ファイルを選択すると、自動的にファイル名（拡張子を除く）が入力されますが、任意の名前に変更できます。


#### [ファイル1, ファイル2] > ヘッダ行数

ファイル中で、ヘッダと見なす行数を指定します。


#### [ファイル1, ファイル2] > 高度な設定 > フィルタ

無視する行の条件を指定できます。
言語は JavaScript で、評価値が `true` であればその行を残し、`false` であれば省略します。
行の各要素は、配列名 `a` （長さは行の要素数）でアクセスできます。 `a` の各要素は、string 型です。

##### 例1

次の表で `SECTION_ID` 列（1列目）の値が `230` である行のみ読み取る場合は、次のように記述します。

![](./materials/1-4.png)

```js
a[1] == '230'
```


##### 例2

1列目の値が `0` である行のみ読み取る場合は、次のように記述します。
```js
a[1] == '0'
```

なお、次のように記述すると、`0` および空白である行を読み取ります（JavaScriptの暗黙の型変換により、空白も `0` だと認識されます）。
```js
a[1] == 0
```
暗黙の型変換を深く理解していない場合は、想定外の動作が起こり得るため、右辺は string 型にする（この例では `0` ではなく `'0'` とする）ことをお勧めします。


##### 例3

0列目と3列目のどちらかが空白である行を読み飛ばす（0列目と3列目の両方が空白でない行のみを読み取る）場合は次のように記述します。
```js
a[0] != '' && a[3] != ''
```


##### 例4

3列目が数値として認識できる行のみ読み取る場合は次のように記述します。空白は数値（ `0` ）であると認識されます。
```js
!isNaN(a[3])
```

空白を除きたい場合は次のように記述します。
```js
!isNaN(a[3]) && a[3] != ''
```


##### 例5

2列目と3列目の文字列連結が、4列目と等しい行のみを読み取る場合は次のように記述します。
```js
a[2] + a[3] == a[4]
```
注意として、この記述は文字列連結であり、2列目と3列目の数値の合計を表すわけではありません。


##### 例6

数値の演算をする場合は、`Number()` で数値に変換して扱います。<br>
2列目と3列目の数値の合計値が、4列目と等しい行のみを読み取る場合は次のように記述します。
```js
Number(a[2]) + Number(a[3]) == Number(a[4])
```


##### 例7

2列目から3列目を引いた差が、4列目と等しい行のみを読み取る場合は次のように記述します。
```js
Number(a[2]) - Number(a[3]) == Number(a[4])
```


##### 例8

2列目が1000以上2000未満である行のみを読み取る場合は次のように記述します。

```js
1000 <= Number(a[2]) && Number(a[2]) < 2000
```


##### 例9（非推奨）

例6から例8は、JavaScriptの暗黙の型変換を利用すれば、`Number()` を省略できます。
ただし、暗黙の型変換は、しばしば想定しない挙動の原因となるため、細心の注意が必要であり、あまり推奨しません。

例6は次のようにも書けます。
```js
+a[2] + (+a[3]) == a[4]
```

例7は次のようにも書けます。
```js
a[2] - a[3] == a[4]
```

例8は次のようにも書けます。
```js
1000 <= a[2] && a[2] < 2000
```



### カラム設計

2つのファイルの列の対応を定義します。


#### 設計 > 列を「増やす」ボタン

表の入力欄を右端に追加します。


####  設計 > 列を「減らす」ボタン

表の最右の入力欄を削除します。


####  設計 > 表 > ファイル1

ファイル1の列を指定します。

書式は3種類あります。
* 単一列指定 `#n` または `#n(s)`（`n`は列数を表す整数、`s`は任意の文字列）
* 連続列指定 `#n-#m` または `#n(s)-#m(t)`（`n`、`m`は列数を表す整数、`s`、`t`は任意の文字列）
* 式指定 `=e` （`e`は JavaScript による数式であり、第`n`列は `#n` または `a[n]` で参照可能）

単一列指定では、1列のみを指定します。

連続列指定では、連続した複数の列を指定できます。例えば、2列目から5列目の場合は `#2-#5` と書きます。単一列指定で個別に `#2`、`#3`、`#4`、`#5` とした場合と等価です。

式指定では、任意の式を記述出来ます。例えば3列目と5列目の和を表す場合は、`=Number(#3)+Number(#5)` または `=Number(a[3])+Number(a[5])` と書きます。列が `#n` で参照できることを除けば JavaScript の書式に従います（ここに書かれたコードは、`#n` を `a[n]` に置換したのち、`eval()`で評価して直接埋め込みます）。


####  設計 > 表 > ファイル2

以下の点を除き、ファイル1と同様です。
* 「おまかせ」ボタンを押すと、ファイル1の列名とファイル2の列名を比較し、ファイル1の列番号に対応すると推測されるファイル2の列番号を自動で入力します。推測に失敗した場合は入力されません。
* 連続列指定では、ファイル1と同じ列数である必要があります。


####  設計 > 表 > 種別

各列の役目を指定します。以下の4種類があります。
* キー：ファイル1とファイル2の比較行を決めるためのキーとして扱います。複数の列をキーとしても構いませんが、キーで唯一の行が指定できる必要があります（キーの重複はできません）。
* 比較：2つのファイルで一致しているかどうか比較します。
* 表示：最終的な結果に表示させる列で、比較の動作に関与しません。
* 無効：キー、比較、表示のいずれとしても扱いません（記述していないのと等価です）。


####  設計 > 表 > 出力ヘッダ

比較結果を出力する際のヘッダ名を記述します。任意の名前を指定できます。「おまかせ」ボタンを押すと、可能な限りファイル2のヘッダの一番下を自動で入力します。


####  設計 > 表 > 文字揃え

比較結果を出力する際の文字揃えを選択できます。「自動」を選択すると、種別がキーの場合は左揃え、その他の場合は数値であれば右揃え、数値でなければ左揃えとなります。



### 実行

#### 比較実行

比較を実行します。
ファイルやカラム設計を変更した場合は、再度クリックすれば更新されます。


#### 表をクリップボードにコピー

「比較実行」で表示されている結果をクリップボードにコピーします。


#### 実行ログ

比較実行のログを示します。


#### 前へ / 次へ

* 「前へ」ボタンを押すと、前の差異がある行へスクロールします。
* 「次へ」ボタンを押すと、次に差異がある行へスクロールします。


#### 結果

* 白い部分は、変化がないことを示しています。「一致行も表示する」のチェックを外して実行すると、行全体が白い行が省略されます。
* 緑色は追加、赤色は削除を示しています。
* 行全体が赤の部分は、`a`のみにキーが存在することを示しています。「キーがファイル1のみに存在する行も表示する」のチェックを外して実行すると省略されます。
* 行全体が緑の部分は、`b`のみにキーが存在することを示しています。「キーがファイル2のみに存在する行も表示する」のチェックを外して実行すると省略されます。


#### トップ 100/200/500/1000 件で比較結果の出力を辞める

「トップ 100/200/500/1000 件で比較結果の出力を辞める」のチェックを入れて実行すると、指定した件数が出力された時点で比較を中断します。

この機能はプレビューとして活用できます。意図せず大量の結果が出力されると処理に負担がかかるため、事前に上限を指定しておくことで、これを防止できます。


#### 左右に並べて表示する（入力の全てのカラムも追加する）

* 「左右に並べて表示する（入力の全てのカラムも追加する）」のチェックを入れて実行すると、ファイル1とファイル2を列ごとに左右に並べた形式で表示します。
* キーがファイル1またはファイル2の片方のみに存在する場合は、その片方のみを表示し、他方は空欄で表示します。
* カラム設計で指定した列に加えて、元の入力ファイルの全てのカラムを表示します。


### その他

#### テンプレートファイルの形式

テンプレートファイルはJSON形式で、次の2つのキーで構成されます。

* `file-select` (object): ファイル選択に関する内容を指定します。
* `cdt` (list of object): カラム設計の表に関する内容を指定します。

ファイル選択に関する部分は、次のキーで定義されるオブジェクトで構成されます。

* `filter1` (string): ファイル1のフィルタを指定します。
* `filter2` (string): ファイル2のフィルタを指定します。


カラム設計の表に関する部分は、表の列ごとに、次のキーで定義されるオブジェクトを作り、列数に合わせたリストで表記します。

* `cdt-file1` (string): ファイル1の列を指定します。
* `cdt-file2` (string): ファイル2の列を指定します。
* `cdt-type` (string): 種別を指定します。{`key` (キー), `compare` (比較), `show` (表示), `disable` (無効)}から選択します。
* `cdt-header` (string): 出力ヘッダを指定します。改行コードは `\n` を使用します。
* `cdt-align` (string): 文字揃えを指定します。{`auto` (自動), `left` (左揃え), `center` (中央揃え), `right` (右揃え)}から選択します。


例えば、次のフィルタ（それぞれファイル1及びファイル2）及びカラム設計の表は、次の設計JSONで記述できます。


![](./materials/4-1.png)
![](./materials/4-1.png)
![](./materials/2-3.png)


```json
{
    "file-select": {
        "filter1": "true",
        "filter2": "true"
    },
    "cdt": [
        {
            "cdt-file1": "#0",
            "cdt-file2": "#0",
            "cdt-type": "key",
            "cdt-header": "ITEM_CODE",
            "cdt-align": "auto"
        },
        {
            "cdt-file1": "#1(SECTION_ID)",
            "cdt-file2": "#1",
            "cdt-type": "key",
            "cdt-header": "SECTION_ID",
            "cdt-align": "auto"
        },
        {
            "cdt-file1": "#2(APRIL)-#4(JUNE)",
            "cdt-file2": "#2-#4",
            "cdt-type": "compare",
            "cdt-header": "APRIL\nMAY\nJUNE",
            "cdt-align": "auto"
        }
    ]
}
```
