import builtins
import io
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import main


def test_run(mocker):
    # モックされた応答オブジェクト
    class Response:
        status_code = 200
        text = "ok"

        def raise_for_status(self):
            pass

    mocker.patch('requests.get', return_value=Response())
    fake_out = io.StringIO()
    mocker.patch.object(builtins, 'print')

    main.run()
    builtins.print.assert_any_call("GASからの返答:")
    builtins.print.assert_any_call("ok")
