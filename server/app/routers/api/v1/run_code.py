
import os
from pathlib import Path
import subprocess

from fastapi import APIRouter, UploadFile
from pydantic import BaseModel
from typing import List, Union

router = APIRouter(prefix="/v1/run", tags=["V1 (run code)"])

@router.post("/code")
async def run_code_in_sandbox(code: str) -> dict:
    """
    引数の code を Docker コンテナ内で実行し、その実行結果を返すサンプル。
    実際の Dify ではこの処理が内部のAPIや呼び出しフローで行われる。
    """

    # 1. 一時的なスクリプトファイルを作成
    workspace_folder = Path(__file__).cwd().resolve()  # run_sandbox.py のディレクトリを基準
    script_path = workspace_folder / "tmp/code_for_sandbox.py"
    os.makedirs(os.path.dirname(script_path), exist_ok=True)
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(code)

    # 2. Docker コマンドを組み立てる
    #    --rm        : 実行終了後、コンテナを自動削除
    #    -v          : スクリプトファイルをコンテナへマウント
    #    --network=none: ネットワーク遮断の例（必要に応じて）
    #    python /app/code_for_sandbox.py : コンテナ内で Python スクリプトを実行
    command = [
        "docker", "run", "--rm",
        "-v", f"{script_path}:/app/code_for_sandbox.py",
        "--network=none",
        os.environ.get("SANDBOX_DOCKER_IMAGE", "aecgeeks/ifcopenshell"),
        "python", "/app/code_for_sandbox.py"
    ]

    # 3. 実行し、標準出力とエラーを取得
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=30  # 例として 30 秒以内に実行が終わるように
    )

    # 4. 結果を返却 (標準出力・標準エラー・終了コード)
    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode
    }



# テスト例
import asyncio

async def test_run_code():
    test_code = """
print("Hello Sandbox!")
"""

    res = await run_code_in_sandbox(test_code)
    print("STDOUT:", res["stdout"])
    print("STDERR:", res["stderr"])
    print("RETURN CODE:", res["returncode"])

if __name__ == "__main__":
    asyncio.run(test_run_code())