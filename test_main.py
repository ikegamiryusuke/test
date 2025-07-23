import main
from unittest.mock import patch, MagicMock


def test_run_success(capsys):
    mock_resp = MagicMock()
    mock_resp.text = "ok"
    mock_resp.raise_for_status = lambda: None

    with patch("requests.get", return_value=mock_resp) as mock_get:
        result = main.run("http://example.com", "テスト")
        mock_get.assert_called_once_with(
            "http://example.com", params={"name": "テスト"}, timeout=10
        )
        assert result == "ok"
        out = capsys.readouterr().out
        assert "GASからの返答:" in out


def test_run_error(caplog):
    with patch(
        "requests.get",
        side_effect=main.requests.exceptions.HTTPError("bad request"),
    ) as mock_get:
        result = main.run("http://example.com", "テスト")
        mock_get.assert_called_once_with(
            "http://example.com", params={"name": "テスト"}, timeout=10
        )
        assert result == ""
        assert any(
            "リクエストエラー" in record.getMessage()
            for record in caplog.records
        )
