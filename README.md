# goo-dic-plugin-for-listary6beta

[Listary 6 Beta](https://discussion.listary.com/t/listary-6-beta/4615) 用の[Goo辞書](https://dictionary.goo.ne.jp/)プラグインです。  
WebAPIがあればよかったんですがなさそうなので、Gooには申し訳ないと思いながらもスクレイピングしています。

## インストール

1. プラグインをインストールします。
  ```cmd
  rem 拡張がインストールされるフォルダに移動（デフォルトの場合）
  cd %AppData%\Listary\UserProfile\Extensions

  rem このリポジトリをクローン
  git clone https://github.com/htsign/goo-dic-plugin-for-listary6beta goo-dic
  ```
2. Listaryが起動済みの場合は一旦終了して、再起動します。
3. これで有効化されているはずですが、そうでない場合は「オプション」→「拡張子<sup>[1](#_1)</sup>」と進み、「Goo 辞書」を Enable にします。

<a name="_1">1</a>: おそらく Extensions の誤訳
