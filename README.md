# Static Web Appsによる最小Webアプリを作る

## はじめに

**記事重すぎで草**

## 今回やること

今回はTodoアプリを作成し，AzureのStatic Web Appsにデプロイ(公開)するまでをやっていきます．Static Web AppsはWebフロントをデプロイするのに使われるサービスですが，Azure Functionsというバックエンドサーバーをくっつけてデプロイすることができたり，認証機能が簡単に付けれたりします．そんな機能をフル活用して，認証機能付きのTodoアプリを作成していきます．また，データベースとして，Azure Storage Accountを使用します．

## Static Web Appのメリット / デメリット

### メリット

#### フロントエンドとバックエンドの繋ぎが楽

Static Web Appsにフロントエンドとバックエンドがくっついた状態でデプロイされるので，両者でドメインが分かれません．なので，フロントエンドがバックエンドに問い合わせしたい時は，`/api/*`にアクセスするだけで可能になります．

#### GitHub認証とAAD(Microsoftアカウント)認証が付いている

`/.auth/login/github`にアクセスするとGitHubアカウントでログイン，`/.auth/login/aad`にアクセスするとMicrosoftアカウントでログインができます．

### デメリット

#### ローカルデバッグが少し面倒

Static Web Apps の機能を使うため，ローカル環境でのデバッグが少し面倒です．ローカル環境でもデバッグができるように，Static Web Apps CLIといういツールがあるので，このツールの使い方に慣れる必要があります．

ただ，慣れれば，デプロイを済ませずとも，フロントエンドとバックエンドを繋ぎこんだ状態でのデバッグができるという利点はあります．

## 環境構築

### Node.js

Node.jsはWeb開発において広く使われていますが，バージョン管理が非常に面倒です．
(共同開発でバージョンが合わないなど...)

そこで，Voltaというツールを使用してバージョンを管理していきます．

また，パッケージの管理は`pnpm`を使用します．

#### Volta のインストール

公式の[Geting Started](https://docs.volta.sh/guide/getting-started)に従って環境構築を行います．

voltaのインストールコマンド
```bash
curl https://get.volta.sh | bash
```

**インストールの確認**

まず，ターミナルを再起動します．

次に，パスが通っているか確認します．確認するには，次のコマンドを実行し，`.bashrc` の中身を確認します．
```bash
cat .bashrc
```
パスが通っていると，`.bashrc`にこの2行が追加されているはずです．
```bashrc
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```
無い場合は，手動で編集して追加しましょう．

最後に，voltaのバージョンを確認するコマンドを実行して，インストールされているか確認します．
```bash
volta -v
```
**出力**
```
1.1.1
```

このようにバージョンが出力された場合はインストール完了です．

---

#### Node.jsのインストール
`Node.js`のインストールを行います．Node.jsのインストールには，先ほどインストールした，`Volta`を使用します．

以下のコマンドを実行して，`Node.js`のインストールを行います．
```bash
volta install node
```
**出力**
```bash
success: installed and set node@20.10.0 (with npm@10.2.3) as default
```
これでNode.jsの最新バージョンがインストールされました．

**バージョンの指定する場合**

バージョンを指定する場合は，`node@19`のように，`@`以下にバージョンを追加するとできます．
```bash
volta install node@19
                   ~~ バージョン指定
```

**インストール確認**

以下のコマンドを入力することで，`Node.js`のバージョンを確認します．
```bash
node -v
```

**出力**
```
20.10.0
```
バージョンが確認出来たら，インストール完了です．

---

#### pnpm のインストール

パッケージ管理ツールである`pnpm`をインストールしていきます．
以下紹介するコマンド等は，公式の[ドキュメント](https://pnpm.io/ja/installation)をもとに紹介しています．
```bash
volta install pnpm
```
**出力**
```bash
success: installed pnpm@8.11.0 with executables: pnpm, pnpx
```
**インストールの確認**
```bash
pnpm -v
```
**出力**
```
8.11.0
```

バージョンが確認出来たら，正常にインストールされています．

---

### Azure Functions Core Tools

Azure Functionsプロジェクトの作成，実行を行うために，`Azure Functions Core Tools`をインストールしていきます．
以下紹介するコマンドは，Microsoftの[公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/azure-functions/functions-run-local?tabs=linux%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-csharp)をもとに紹介しています．

まず，WSL上にパッケージの整合性をチェックするための，MicrosoftパッケージリポジトリのGPGキーをインストールします．以下2つのコマンドを順番に実行します．

```bash
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
```
```bash
sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
```
次に，以下のコマンドを実行し，`apt`のソースリストを設定します．
```bash
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" > /etc/apt/sources.list.d/dotnetdev.list'
```
次に，以下のコマンドを実行し，`apt`ソースを更新します．
```bash
sudo apt-get update
```
最後に，以下のコマンドを実行し，`Azure Functions Core Tools`をインストールしてください．
```bash
sudo apt-get install azure-functions-core-tools-4
```
**インストールの確認**

以下のコマンドを実行し，`Azure Functions Core Tools`のバージョンを確認します．
```bash
func -v
```
**出力**
```bash
4.0.5455
```
このように，バージョンが表示されたら，正常にインストールが完了しました．

### .NET SDK

`C#`の`Azure Functions`を実行するために，`.NET SDK`をインストールしていきます．以下紹介するコマンドはMicrosoftの[公式ドキュメント](https://learn.microsoft.com/ja-jp/dotnet/core/install/linux-ubuntu-2204)をもとに紹介しています．

以下の2つのコマンドを順番に実行して，インストールしていきます．

```bash
sudo apt-get update
```
```bash
sudo apt-get install -y dotnet-sdk-8.0
```
これでインストールが完了です．

**インストールの確認**
以下のコマンドを実行して，バージョンを確認していきます．
```bash
dotnet --vertion
```
**出力**
```bash
8.0.100
```
このようにバージョンが表示された場合は，正常にインストール完了です．

### Static Web Apps CLI

clientとapiのつなぎ込みや，認証機能などは，AzureのStatic Web Appsの機能を使用します．そのStatic Web Appsの機能をローカルでデバッグするためのツールが`Atatic Web Apps CLI`です．
以下紹介するコマンドは，公式の[ドキュメント](https://azure.github.io/static-web-apps-cli/docs/use/install/)をもとに紹介しています．

`Static Web Apps CLI`をインストールするには，以下のコマンドを実行します．
```bash
npm install -g @azure/static-web-apps-cli
```

これでインストール完了です．

**インストールの確認**

以下のコマンドを実行して，`Static Web Apps CLI`のバージョンを確認します．
```bash
swa -version
```

**出力**
```bash
Welcome to Azure Static Web Apps CLI (1.1.6)

1.1.6
```

このように，バージョンが出力されたら，インストール完了です．

### Azurite

`Azure Storage Account`をローカル環境でデバッグする際に，`Azurite`を使用します．インストールするには以下のコマンドを実行します．

```bash
npm install -g azurite
```

**インストールの確認**
インストールの確認には，以下のコマンドを実行して，バージョンを確認します．
```bash
azurite -v
```

**出力**
```bash
3.28.0
```
このようにバージョンが表示された場合はインストール完了です．

### Microsoft Azure Storage Explorer
`Microsoft Azure Storage Explorer`は，`Azure Storage Account`に保存されているデータをGUIで見ることができる便利ツールです．

[ここ](https://azure.microsoft.com/ja-jp/products/storage/storage-explorer/)からダウンロードページに飛び，「今すぐダウンロード」から「Windows」を選択します．

![download-azurite](/assets/download-azurite.png)

ダウンロードしたファイルを実行し，利用規約に同意してインストールをしたら，完了です．

### Make

今回のプロジェクトは，デバッグに多数のコマンドを使用するため，使用するコマンドをあらかじめ`Makefile`として定義しておくととても便利です．今回のプロジェクトに必須ではありませんが，使用することを推奨します．

インストールするには，次のコマンドを実行してください．

```bash
sudo apt update
```
```bash
sudo apt install make
```

これで`Makefile`を使用することができます．

**インストールの確認**
```bash
make -v
```

**出力**

```bash
GNU Make 4.3
Built for x86_64-pc-linux-gnu
Copyright (C) 1988-2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```

このようにバージョンが表示された場合は，正常にインストール完了です．

## プロジェクト作成

### プロジェクトの構成

今回は，フロントエンドとして`Vite` + `React.js` + `TypeScript`のプロジェクト，バックエンドとして，`C#`の`Azure Functions`プロジェクトを使用します．

**ディレクトリ構成**
```
todo-app
  ├ api
  │  └ Azure Functionsのプロジェクト
  │
  └ client
     └ Vite + Reactのプロジェクト
```
`todo-app/client`: フロントエンド部分

`todo-app/api`: バックエンド部分

### Vite + React.js + TypeScript

`Vite` + `React.js` + `TypeScript`のプロジェクトを作成するには，`/todo-app`ディレクトリで以下のコマンドを実行します．

```bash
pnpm create vite@latest
```
このコマンドを実行すると，`プロジェクト名`, `フレームワーク`，`言語`を問われます．
今回はプロジェクト名を`client`にし，フレームワークは`React`，言語は`TypeScript + SWC`にします．

フレームワークと言語は方向キーで操作し，Enterキーで確定します．

**プロジェクト名**
```bash
?Project name: client
```

**フレームワーク**

```bash
?Select a framework:
    Vanilla
    Vue
>   React
    Preact
    Lit
    Svelte
    Solid
    Qwik
    Others
```

**言語**

```bash
?Select a variant:
    TypeScript
>   TypeScript + SWC
    JavaScript
    JavaScript + SWC
```

**出力**
```bash
.../share/pnpm/store/v3/tmp/dlx-3249     |   +1 +
.../share/pnpm/store/v3/tmp/dlx-3249     | Progress: resolved 1, reused 1, downloaded 0, added 1, done
✔ Project name: … client
✔ Select a framework: › React
✔ Select a variant: › TypeScript + SWC

Scaffolding project in /home/<yourName>/.../todo-app/client...

Done. Now run:

  cd client
  pnpm install
  pnpm run dev
```

最後に，依存関係のインストールを済ませて，実行準備を完了させましょう．

```bash
cd client && pnpm install
```

**出力**
```bash
Downloading registry.npmjs.org/typescript/5.3.2: 5.76 MB/5.76 MB, done
Packages: +156
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Downloading registry.npmjs.org/@swc/core-linux-x64-gnu/1.3.99: 15.40 MB/15.40 MB, done
Downloading registry.npmjs.org/@swc/core-linux-x64-musl/1.3.99: 18.33 MB/18.33 MB, done
Progress: resolved 195, reused 0, downloaded 156, added 156, done
node_modules/.pnpm/@swc+core@1.3.99/node_modules/@swc/core: Running postinstall script, done in 155ms
node_modules/.pnpm/esbuild@0.19.8/node_modules/esbuild: Running postinstall script, done in 132ms

dependencies:
+ react 18.2.0
+ react-dom 18.2.0

devDependencies:
+ @types/react 18.2.39
+ @types/react-dom 18.2.17
+ @typescript-eslint/eslint-plugin 6.13.0
+ @typescript-eslint/parser 6.13.0
+ @vitejs/plugin-react-swc 3.5.0
+ eslint 8.54.0
+ eslint-plugin-react-hooks 4.6.0
+ eslint-plugin-react-refresh 0.4.4
+ typescript 5.3.2
+ vite 5.0.2

The dependency was already listed in devDependencies.
If you want to make it a prod dependency, then move it manually.

Done in 27.9s
```

これで，クライアント側のプロジェクト作成と実行準備が整いました．

### Azure Functions (C#)

Azure Functions のプロジェクトを作成するには，まずプロジェクト用のディレクトリを作成し，ディレクトリを移動します．
```bash
makdir api
cd api
```
次に，以下のコマンドを実行して，プロジェクトを作成します．
```bash
func init
```

実行すると，プロジェクトテンプレートの種類を聞かれるので，該当する数字を入力して作成します．
今回は，ランタイムは`dotnet`，言語は`c#`を選択します．

**出力**
```bash
Select a number for worker runtime:
1. dotnet
2. dotnet (isolated process)
3. node
4. python
5. powershell
6. custom
Choose option: 1
dotnet
Select anumber for language:
1. c#
2. f#
Choose option: 1
c#

Writing /home/<yourName>/.../todo-app/api/.vscode/extentions.json
```
これでプロジェクトの作成は完了です．ただし，この状態では，apiが一切定義されていないので，適当にサンプルのapiを生成します．

以下のコマンドを`/todo-app/api`のディレクトリ下で実行してください．
```bash
func new
```
すると，テンプレートの種類と名前を作成することを要求されます．今回は，テンプレートは`HttpTrigger`，名前は`SampleFunction`とします．

**出力**
```bash
Select a number for template:
1. QueueTrigger
2. HttpTrigger
3. BlobTrigger
4. TimerTrigger
5. KafkaTrigger
6. KafkaOutput
7. DurableFunctionsOrchestration
8. SendGrid
9. EventHubTrigger
10. ServiceBusQueueTrigger
11. ServiceBusTopicTrigger
12. EventGridTrigger
13. CosmosDBTrigger
14. IotHubTrigger
15. DaprPublishOutputBinding
16. DaprServiceInvocationTrigger
17. DaprTopicTrigger
Choose option: 2
Function name: SampleFunction
SampleFunction

Creating dotnet function...
The function "SampleFunction" was created successfully from the "HttpTrigger" template.
```

これで，サンプルのapiが作成されました．これで実行準備が完了しました．

### Static Web Apps CLI

今回はデバッグに`Static Web Apps CLI`を使用するため，今回のプロジェクトに対して，`Static Web Apps CLI`のセットアップをしていきます．

`/todo-app`ディレクトリ下で以下のコマンドを実行してください．
```bash
swa init
```

すると，設定の名前の入力とアプリの設定を質問されます．このあたりの構成は，現状作っているプロジェクトを参照して，勝手に生成されますが，若干違いもあるので，修正していきます．

まず，設定の名前を質問されますが，既に表示されている`todo-app`という名前で大丈夫です．

次に，アプリの構成を読み取って，設定を自動で生成してくれます．

```bash
Detected configuration for your app:
- Framework(s): Vite, with API: .NET, .NET
- App location: client
- Output location: dist
- API location: api
- API language: dotnetisolated
- API version: 6.0
- Data API location: 
- App build command: npm run build
- API build command: dotnet publish -c Release
- App dev server command: npm run dev
- App dev server URL: http://localhost:5173

- API dev server URL: 

? Are these settings correct? > (Y/n)
```
ただし，今回は

`API language`は`dotnet`

`App build command`は`pnpm run build`

`App dev server command`は`pnpm run dev`

になるため，`n`を入力して修正していきます．

**API language**
```bash
?What's your API language (optional) > Use arrow-keys. Return to submit.
  Node.js
  Python
> Dotnet
  Dotnet isolated
```

**App build command**
```bash
?What command do you use to build your app? (optional) › pnpm run build
```

**App dev server command**
```bash
? What command do you use to run your app for development? (optional) › pnpm run dev
```

**出力**
```bash
Welcome to Azure Static Web Apps CLI (1.1.6)

✔ Choose a configuration name: … todo-app

Detected configuration for your app:
- Framework(s): Vite, with API: .NET, .NET
- App location: client
- Output location: dist
- API location: api
- API language: dotnetisolated
- API version: 6.0
- Data API location: 
- App build command: npm run build
- API build command: dotnet publish -c Release
- App dev server command: npm run dev
- App dev server URL: http://localhost:5173

- API dev server URL: 

✔ Are these settings correct? … no
✔ What's your app location? … client
✔ What's your build output location? … dist
✔ What's your API location? (optional) … api
✔ What's your API language? (optional) › Dotnet
✔ What's your API version? (optional) › 6.0
✔ What's your data API location? (optional) … 
✔ What command do you use to build your app? (optional) … pnpm run build
✔ What command do you use to build your API? (optional) … dotnet publish -c Release
✔ What command do you use to run your app for development? (optional) … pnpm run dev
✔ What's your app development server URL (optional) … http://localhost:5173
✔ What's your API development server URL (optional) … 
✔ Configuration with name "todo-app" already exists, overwrite? … yes

Configuration successfully saved to swa-cli.config.json.

Get started with the following commands:
- Use swa start to run your app locally.
- Use swa build to build your app.
- Use swa deploy to deploy your app to Azure.
```

ここで設定した構成は，`swa-cli.config.json`に保存されています．

**swa-cli.config.json**
```json
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "todo-app": {
      "appLocation": "client",
      "apiLocation": "api",
      "outputLocation": "dist",
      "apiLanguage": "dotnet",
      "apiVersion": "6.0",
      "appBuildCommand": "pnpm run build",
      "apiBuildCommand": "dotnet publish -c Release",
      "run": "pnpm run dev",
      "appDevserverUrl": "http://localhost:5173"
    }
  }
}
```

これで，`Static Web Apps CLI`の準備は完了です．

### Makefile

ここまで，おおよそのプロジェクトの作成が完了しました．ではここで実行コマンドを確認しておきましょう．

フロントエンドの起動は`/todo-app/client`ディレクトリ下で次のコマンドで実行できます．

```bash
pnpm run dev
```

バックエンドの起動は`/todo-app/client`ディレクトリ下で次のコマンドで実行できます．

```bash
func start
```

`Azurite`の起動は`/todo-app`ディレクトリ下で次のコマンドで実行できます．
```bash
azurite --silent --location c:\azurite --debug c:\azurite\debug.log
```

`Static Web Apps CLI`の実行は`/todo-app`ディレクトリ下で次のコマンドで実行できます．

```bash
swa start http://localhost:5173 --api-devserver-url http://localhost:7071
```

この4つのコマンドを実行することになります．いちいち打つのはまぁ超面倒ですよね...

そこで，これらのコマンド`Makefile`に定義していきます．`/todo-app`ディレクトリ下で，`Makefile`という名前のファイルを作り，以下の内容を入力して保存します．

```Makefile
.PHONY: swa client api azurite

swa:
	swa start http://localhost:5173 --api-devserver-url http://localhost:7071

client:
	cd client && pnpm run dev

api:
	cd api && func start 

azurite:
	azurite --silent --location c:\azurite --debug c:\azurite\debug.log
```

こうすると，

フロントエンドの実行コマンド
```bash
make client
```
バックエンドの実行コマンド
```bash
make api
```
`Azurite`起動コマンド
```bash
make azurite
```
`Static Web Apps CLI`の実行コマンド
```bash
make swa
```

となり，入力がだいぶ楽になります．さらにTabキーで補完ができるのでさらに楽です．

特に`Static Web Apps CLI`は起動コマンドが長いので，このように`Makefile`を書くことを推奨します．

### 実行してみる

それでは，作成したプロジェクトを実行してみましょう．コマンドは`Makefile`で定義したものを使用します．

#### フロントエンド単体で実行
実行コマンド
```bash
make client
```

**出力**
```bash
 VITE v5.0.2  ready in 474 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

`http://localhost:5173`をブラウザで開きます．すると，下の画像のようなサイトに飛ぶことができます．

![default-client](/assets/default-client.png)

これでフロントエンド単体の実行は完了です．サイトの外見だけのチェックであればこれで十分です．

#### バックエンド単体で実行

実行コマンド
```bash
make api
```
**出力**

```bash
MSBuild version 17.8.3+195e7f5a3 for .NET
  Determining projects to restore...
  All projects are up-to-date for restore.
  api -> /home/<yourName>/.../todo-app/api/bin/output/api.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:04.56



Azure Functions Core Tools
Core Tools Version:       4.0.5455 Commit hash: N/A  (64-bit)
Function Runtime Version: 4.27.5.21554

[2023-12-03T18:35:13.838Z] Found /home/<yourName>/.../todo-app/api/api.csproj. Using for user secrets file configuration.

Functions:

        SampleFunction: [GET,POST] http://localhost:7071/api/SampleFunction

For detailed output, run func with --verbose flag.

```

ここで，`http://localhost:7071/api/SampleFunction`にブラウザでアクセスすると，下のように表示されます．

![default-api](/assets/default-api.png)

また，`Azure Storage Account`の操作はバックエンドの仕事なので，操作のテストを行いたい場合は`Azurite`も起動しましょう．

```bash
make azurite
```

**出力**

```bash
Azurite Blob service is starting at http://127.0.0.1:10000
Azurite Blob service is successfully listening at http://127.0.0.1:10000
Azurite Queue service is starting at http://127.0.0.1:10001
Azurite Queue service is successfully listening at http://127.0.0.1:10001
Azurite Table service is starting at http://127.0.0.1:10002
Azurite Table service is successfully listening at http://127.0.0.1:10002
```

これでバックエンド単体での実行は完了です．バックエンドが想定通りのデータを返しているかチェックするだけであればこれで十分です．

#### Static Web Apps CLI を起動

**フロントエンドとバックエンドを起動した状態で**別のターミナルを開き，コマンドを実行します．

実行コマンド
```bash
make swa
```

**出力**
```bash
Welcome to Azure Static Web Apps CLI (1.1.6)

***********************************************************************
* WARNING: This emulator may not match the cloud environment exactly. *
* Always deploy and test your app in Azure.                           *
***********************************************************************

[swa] 
[swa] Using dev server for static content:
[swa]   http://localhost:5173
[swa] 
[swa] Using dev server for API:
[swa]   http://localhost:7071
[swa] 
[swa] Azure Static Web Apps emulator started at http://localhost:4280. Press CTRL+C to exit.
[swa] 
[swa] 

```

これで，`http://localhost:4280`をブラウザで開きます．すると，下のように，作成中のフロントエンドアプリが表示されるはずです．

![default-client](/assets/default-client.png)

また，`http://localhost:4280/api/SampleFunction`に飛ぶと，バックエンドのレスポンスが帰ってきます．

![default-api](/assets/default-api.png)

フロントエンドとバックエンドが統合された状態での機能を追加する場合は，`Static Web Apps CLI`を使いましょう．

## 開発開始

### フロントエンド

#### 概要

今回作成するTodoアプリに必要なものをリストアップしてみます．

**UIの部品**
|コンポーネント名|説明|
|:--|:--|
|`Header`|ヘッダー．ログイン/ログアウト ボタンを配置する．|
|`TodoList`|現在のTodoリストを表示する．|
|`Form`|Todoを追加するためのフォーム．|

**機能**
|機能名|説明|
|:--|:--|
|`get-profile`|ユーザー情報を取得する．|
|`todos`|Todoの取得，追加，削除する．|

**プロバイダー**
|プロバイダー名|説明|
|:--|:--|
|`AppProvider`|アプリ全体で共有する状態を管理するProvider．ログインの状態管理に使用します．|
|`TodoItemProvider`|Todoの状態を管理するProvider．|

ディレクトリ構造は下のようになりました．`react.js`は基本的に`/src`以下にファイルを配置していきます．UIの部品は`/src/components`以下，機能は`/src/features`以下に，プロバイダーは`/src/providers`以下に配置します．

**ディレクトリ構成**
```
client
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public
│   └── vite.svg
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── Form
│   │   │   ├── Form.css
│   │   │   └── Form.tsx
│   │   ├── Header
│   │   │   ├── Header.css
│   │   │   └── Header.tsx
│   │   └── TodoList
│   │       ├── TodoList.css
│   │       └── TodoList.tsx
│   ├── features
│   │   ├── get-profile
│   │   │   ├── api
│   │   │   │   └── ClientPrincipal.ts
│   │   │   └── index.ts
│   │   └── todos
│   │       ├── api
│   │       │   ├── TodoAction.ts
│   │       │   ├── TodoItem.ts
│   │       │   └── TodoItemRequest.ts
│   │       └── index.ts
│   ├── index.css
│   ├── main.tsx
│   ├── providers
│   │   ├── AppProvider.tsx
│   │   └── TodoItemProvider.tsx
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

#### 機能を実装する

`/src/features`にアプリの機能部分を実装していきます．基本的にここには，バックエンドとの繋ぎこみの処理を書いていきます．

##### todos

まず，Todoのデータを格納する型を作っていきます．`features/todos/api`以下に作成します．

**TodoItem.ts**
```ts
type TodoItem = {
    id: string;
    userId: string;
    title: string;
    description: string;
}

export type { TodoItem };
```

また，Todoを追加する際に，バックエンドに問い合わせる情報の型を作っていきます．

**TodoItemRequest.ts**
```ts
type TodoItemRequest = {
    userId: string;
    title: string;
    description: string;
}

export type { TodoItemRequest }
```

そして，Todoの取得，追加，削除の処理を追加していきます．ただし，バックエンドはまだ作っていないので，適当なデータを返すように書いていきます．`/features/todos`以下に次のファイルを追加します．

**index.ts**
```ts
import { TodoItem } from "./api/TodoItem";
import { TodoItemRequest } from "./api/TodoItemRequest";

async function GetTodos(userId: string) {

  //適当なデータ
    const body = [
        {
            id: "7ff198b0-8bbe-4d6c-a7b0-ab4a527d5389",
            userId: userId,
            title: "Test1",
            description: "Test1"
        },
        {
            id: "1ad0f127-4f79-46e2-9e16-1eb707a371fb",
            userId: userId,
            title: "Test2",
            description: "Test2",
        },
        {
            id: "586ce27f-bd18-4cf6-b7ff-3c3f410748c2",
            userId: userId,
            title: "Test3",
            description: "Test3",
        }
    ] as TodoItem[];
    return body;
}

async function PostTodos(todo: TodoItemRequest) {

    //適当なデータ
    const body = {
        id: "f3b892e3-9ccd-408a-99a4-cc86dea37463",
        userId: todo.userId,
        title: todo.title,
        description: todo.description
    } as TodoItem;

    return body;
}

async function DeleteTodos(todo: TodoItem) {
    
}

export { GetTodos };
export { PostTodos };
export { DeleteTodos };
```

##### get-profile

認証情報を取得する機能を追加していきます．ログイン済みの状態で，`/.auth/me`にアクセスすると，ユーザー情報を取得することができます．ただし，この機能のデバッグには`Static Web Apps CLI`の起動が必須になります．ユーザー情報は以下のような形式で取得できます．

```json
{
    "clientPrincipal": {
        "identityProvider": "github",
        "userId": "je89c8db0-3f6c-4f73-a802-20bfe0134f4c",
        "userDetails": "UserName",
        "userRoles": [
            "anonymous",
            "authenticated"
        ]
    }
}
```
このデータ形式に合わせて，データを受け取るための型を作成していきます．

`/get-profile/api`に次のファイルを作成していきます．

**ClientPrincipal.ts**
```ts
type ClientPrincipal = {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
}

type AuthResponse = {
    clientPrincipal: ClientPrincipal;
}

export type { ClientPrincipal };

export type { AuthResponse };
```

`AuthResponse`型でデータを受け取っていきます．`/features/get-profile`いかに次のファイルを作成します．

**index.ts**
```ts
import { AuthResponse } from "./api/ClientPrincipal";

async function GetProfile() {
    const result = await fetch('/.auth/me');
    const body = await result.json() as AuthResponse;
    return body;
}

export { GetProfile };
```

ログインしていない場合は，`AuthResponse`内の`clientPrincipal`に`null`が入っているので，これでログインしているか，していないかを判定します．

#### プロバイダーを実装する

##### AppProvider

`useState`でユーザー情報を状態として持ち，その情報をProviderとして子コンポーネントに提供します．`useEffect`で読み込み時に`GetProfile`を呼び出し，ユーザー情報を取得して`setUser`で反映させています．

**AppProvider.tsx**
```ts
import React, { createContext, useEffect, useState } from "react"
import { GetProfile } from "../features/get-profile";
import { AuthResponse } from "../features/get-profile/api/ClientPrincipal";

type AppProviderProps = {
    children: React.ReactNode;
};

const AppContext = createContext<AuthResponse | null>(null);

const AppProvider : React.FC<AppProviderProps> = ({children}) => {
    const [user, setUser] = useState<AuthResponse | null>(null);

    useEffect(() =>
    {
        GetProfile().then((response) => setUser(response));
    }, []);

    if(user === null){
        return <div>Loading...</div>
    }

    return(
        <AppContext.Provider value={user}>
            {children}
        </AppContext.Provider>
    )
};

export function useAppContext(){
    const context = React.useContext(AppContext);
    if(context === undefined){
        throw new Error("useAppContext must be used within a AppProvider");
    }
    return context;
}

export default AppProvider;
```

##### TodoItemProvider

**TodoAction.ts**

各アクション(Todoを追加する，削除する等)ごとに必要なパラメーター
```ts
import { TodoItem } from "./TodoItem";

type TodoAction =
    { type: 'ADD_TODO', todo: TodoItem } |
    { type: 'REMOVE_TODO', id: string } |
    { type: 'GET_TODOS', todos: TodoItem[]};

export type { TodoAction };
```

**TodoItemProvider.tsx**
```ts
import React, { Dispatch, createContext, useEffect, useReducer } from "react";
import { TodoItem } from "../features/todos/api/TodoItem";
import { GetTodos } from "../features/todos";
import { TodoAction } from "../features/todos/api/TodoAction";
import { useAppContext } from "./AppProvider";

type TodoItemProviderProps = {
    children: React.ReactNode;
};

const TodoItemContext = createContext<{
    todos: TodoItem[];
    dispatch: Dispatch<TodoAction>;
} | undefined>(undefined);


const initialtodos: TodoItem[] = [];

const reducer = (todos: TodoItem[], action: TodoAction) => {
    switch (action.type) {
        case "ADD_TODO":{
            if(action.todo.title === ""){
                return todos;
            }      
            //元のtodosと追加したtodoを連結して返す
            return [...todos, action.todo]
        }
        case "REMOVE_TODO":{
            //todosの中で，削除するidのアイテム以外を返す
            return todos.filter(todo => todo.id !== action.id);
        }
        case "GET_TODOS":
            //渡したtodosをそのまま返す
            return action.todos;
        default:
            return todos;
        }
    }
           
const TodoItemProvider : React.FC<TodoItemProviderProps> = ({children}) =>{
    const resource = useAppContext();
    const [todos, dispatch] = useReducer(reducer, initialtodos);
    const isLoggedIn = resource?.clientPrincipal !== null;

    useEffect(() =>
    {
        //ログインしていないときは何もしない
        if(!isLoggedIn){
            return;
        }
        //GetTodosでTodoを取得し，dispatchでtodosにセットする
        GetTodos(resource?.clientPrincipal.userId ?? "").then((response) => {
            dispatch({type: "GET_TODOS", todos: response})
        });
    }, []);

    if(todos === null){
        return <div>Loading...</div>
    }

    return(
        <TodoItemContext.Provider value={{todos, dispatch}}>
            {children}
        </TodoItemContext.Provider>
    )
};

export function useTodoItemContext(){
    const context = React.useContext(TodoItemContext);
    if(context === undefined){
        throw new Error("useTodoItemContext must be used within a TodoItemProvider");
    }
    return context;
}

export default TodoItemProvider;
```

#### UIを実装する

##### Header

**Header.tsx**
```ts
import './Header.css'
import { useAppContext } from "../../providers/AppProvider"

function Header(){
    //AppProviderのAppContextからユーザー情報を取得する
    const resource = useAppContext();
    //clientPrincipalがnullかどうかでログインしているか判定する
    const isLoggedIn = resource?.clientPrincipal !== null;

    return(
        <header>
        <h2>Todo-App</h2>
        <div>
            <!--ログイン状態の時-->
            {isLoggedIn ? (
                <a href="/.auth/logout">ログアウト</a>
            ) : (
            <!--ログインしていないとき-->
                <a href="/.auth/login/github">ログイン</a>
            )}
        </div>
        </header>
    )
}

export default Header
```

`Header.css`でお好みの見た目にしてみてください．

##### TodoList

**TodoList.tsx**
```ts
import { DeleteTodos } from '../../features/todos';
import { useAppContext } from '../../providers/AppProvider';
import { useTodoItemContext } from '../../providers/TodoItemProvider';
import './TodoList.css';

function TodoList(){
    //AppProviderのAppContextからユーザー情報の取得
    const resource = useAppContext();
    //TodoItemProviderのTodoItemContextから，todosとdispatchメソッドの取得
    const {todos, dispatch} = useTodoItemContext();
    const isLoggedIn = resource?.clientPrincipal !== null;

    return (
        <div className='root'>
            {
                isLoggedIn ? (
                    <div>
                        <h1>あなたのタスク</h1>
                        <ul className='todo-list'>
                            <!--todosのすべての要素に対して以下のようなUIを実装-->
                            {todos.map((todo, i) => (
                                <li key={i}>
                                <div className='over-view'>
                                    <div className='title item-border'>
                                        {todo.title}
                                    </div>
                                    <div className='description'>
                                        {todo.description}
                                    </div>
                                </div>
                                <button onClick={async () => {
                                    await DeleteTodos(todo);
                                    dispatch({type:'REMOVE_TODO',id:todo.id})   
                                    }} 
                                    className='button'>完了</button>
                            </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>
                        <p>ログインしてください</p>
                    </div>
                )
            }
        </div>
    )
}

export default TodoList
```

`TodoList.css`でお好みの見た目にしてください．

##### Form

**Form.tsx**
```ts
import React from "react";
import { useAppContext } from "../../providers/AppProvider";
import { useTodoItemContext } from "../../providers/TodoItemProvider";
import { PostTodos } from "../../features/todos";
import './Form.css';


function Form() {
    const resource = useAppContext();
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const {dispatch} = useTodoItemContext();

    //追加ボタンを押したときの処理
    async function onSubmited(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        var response = await PostTodos({title, description, userId: resource?.clientPrincipal.userId ?? ""});
        dispatch({type: "ADD_TODO", todo: response});
    }

    const isLoggedIn = resource?.clientPrincipal !== null;
    return(
        <div className="form">
        {
            isLoggedIn ? (
            <div>
                <h1>タスクを追加</h1>
                <form onSubmit={onSubmited}>
                    <h2>タイトル</h2>
                    <input
                        className="title"
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        type="text" />
                    <h2>説明</h2>
                    <input
                        className="description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        type="text" />
                    <button className="submit" type="submit">追加</button>
                </form>
            </div>
            ) : (
                <div>
                </div>
            )
        }
        </div>
    )
}

export default Form
```

`Form.css`でお好みの見た目にしてください．

#### App.tsxを編集
最後に，`App.tsx`を編集して，これまで作成した部品を組み立てます．
```ts
//import './App.css'
import AppProvider from './providers/AppProvider'
import Header from './components/Header/Header'
import TodoList from './components/TodoList/TodoList'
import Form from './components/Form/Form'
import TodoItemProvider from './providers/TodoItemProvider'

function App() {

  return (
    <>
      <AppProvider>
        <Header/>
        <TodoItemProvider>
          <TodoList/>
          <Form/>
        </TodoItemProvider>
      </AppProvider>
    </>
  )
}

export default App

```

#### staticwebapp.config.json

`staticwebapp.config.json`はその名の通り，`Static Web Apps`の設定を書くファイルです．このファイルを編集すると，ユーザーが特定のページへのアクセスを制限したり，別のページにリダイレクトさせたりするような，ルールを書くことができます．

例えば，`/admin`というページにサイト管理するようなページを作成したとすると，ただページを作成しただけでは，URLに`/admin`と打ち込むだけで誰でも簡単にアクセスできてしまいます．ここで，`staticwebapp.config.json`に以下のような記述をします．

**staticwebapp.config.json**
```json
{
  "routes":[
    {
      "route":"/admin",
      "allowedRoles":["admin"]
    }
  ]
}
```
こうすることによって，`/admin`にアクセスするユーザーが，`"admin"`というロールが無いとこのページにアクセスできないようになります．

**ユーザー情報**
```json
{
    "clientPrincipal": {
        "identityProvider": "github",
        "userId": "je89c8db0-3f6c-4f73-a802-20bfe0134f4c",
        "userDetails": "UserName",
        "userRoles": [
            "anonymous",
            "authenticated"
            //ここに"admin"という項目が無いとアクセスできない
        ]
    }
}
```

今回のTodoアプリには，以下のようなルールを設けようと思います．
- `/api/*`(バックエンドへの問い合わせ)は認証したユーザー(`"authenticated"`ロールを持つユーザー)しかできないようにする．
- `/.auth/login/github`を`/login`で簡略化する
- `/.auth/logout`を`/logout`で簡略化する
- AAD認証は出来ないようにする

この構成を行う`staticwebapp.config.json`は以下のようになります．

**staticwebapp.config.json**
```json
{
    "trailingSlash": "auto",
    "routes":[
        {
            "route":"/",
            "allowedRoles":["anonymous","authenticated"]
        },
        {
            "route":"/api/*",
            "allowedRoles":["authenticated"]
        },
        {
            "route": "/login",
            "rewrite": "/.auth/login/github"
        },
        {
            "route":"/logout",
            "redirect":"/.auth/logout"
        },
        {
            "route":"/.auth/login/aad",
            "statusCode":404
        }
    ]
}
```
では，ログイン，ログアウトのルートが変わったので，`Header.tsx`も書き換えましょう．

```ts
import './Header.css'
import { useAppContext } from "../../providers/AppProvider"

function Header(){
    const resource = useAppContext();

    const isLoggedIn = resource?.clientPrincipal !== null;

    return(
        <header>
        <h2>Todo-App</h2>
        <div>
            {isLoggedIn ? (
                <a href="/logout">ログアウト</a>
            ) : (
                <a href="/login">ログイン</a>
            )}
        </div>
        </header>
    )
}

export default Header
```

`staticwebapp.config.json`のもっと細かい設定が気になる人は[こちら](https://learn.microsoft.com/ja-jp/azure/static-web-apps/configuration)の公式ドキュメントを読んでみてください．

これで，フロントエンドの大部分が完成です．

#### 実行してみる

`Static Web Apps CLI`を起動して，http://localhost:4280 にアクセスしてみましょう．

![mainpage](/assets/mainpage.png)

ログインしていない状態だと，このように表示されるはずです．では，ログインボタンを押して，ログインしてみましょう．

![locallogin](/assets/locallogin.png)
すると，このようなページが表示されるはずです．デプロイ先の環境では，実際のGitHubアカウントと連携しますが，`Static Web Apps CLI`を使用したデバッグだと，このようにユーザー情報を好きにいじってテストができるようになっています．今回は適当なUsernameを入力してLoginボタンを押しましょう．

![loggedinpage](/assets/logedinpage.png)

このように表示され，完了を押すとリストから削除され，フォームからタイトルと説明を入力して追加ボタンを押すと，リストに追加されます．

では，一度ログアウトして，URLに`/.auth/login/aad`を追加して，無理やりAAD認証しようとします．

![notfound](/assets/notfound.png)

`staticwebapp.config.json`でAAD認証使用しようとすると，404を返すように設定しているので，`404: Not Found`のページが表示されます．

また，このログアウトした状態で，`/api/SampleFunction`にアクセスしてみます．

![unauthorized](/assets/unauthorized.png)
`staticwebapp.config.json`で認証済みユーザーにしか`/api/*`にアクセスできないようにしたので，このように`401: Unauthorized`のページが表示されます．

### バックエンド

### 繋ぎこみ

## デプロイ