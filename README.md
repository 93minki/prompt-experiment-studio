# prompt-experiment-studio

## Backend

백엔드는 항상 `prompt-experiment-studio-be` 폴더에서 실행합니다.

### 설치

사전 준비:

- Python 3.13
- `uv`

설치 예시:

```bash
git clone <repo-url>
cd prompt-experiment-studio/prompt-experiment-studio-be
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

### 로컬에서만 실행

같은 PC에서만 프론트와 백엔드를 띄울 때:

```bash
cd prompt-experiment-studio/prompt-experiment-studio-be
source .venv/bin/activate
python -m uvicorn main:app --reload
```

접속 주소:

```text
http://127.0.0.1:8000
```

### 같은 네트워크의 다른 사람도 접속 가능하게 실행

같은 사내망, 와이파이, 공유기 내부망 등에서 다른 PC도 접속해야 할 때:

```bash
cd prompt-experiment-studio/prompt-experiment-studio-be
source .venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

다른 PC에서는 아래처럼 서버를 연 사람의 IP로 접속:

```text
http://<백엔드_실행_PC_IP>:8000
```

### 가상환경 재설치

가상환경이 꼬였으면 백엔드 폴더 안의 `.venv`만 다시 만들면 됩니다.

```bash
cd prompt-experiment-studio/prompt-experiment-studio-be
rm -rf .venv
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

## Frontend

프론트는 `prompt-experiment-studio-fe` 폴더에서 실행합니다.

### 설치

```bash
cd prompt-experiment-studio/prompt-experiment-studio-fe
yarn install
```

프론트는 백엔드 주소를 `http://127.0.0.1:8000`으로 사용합니다.

### 로컬에서만 실행

같은 PC에서 백엔드도 함께 띄울 때:

```bash
cd prompt-experiment-studio/prompt-experiment-studio-fe
yarn dev
```

접속 주소:

```text
http://127.0.0.1:5173
```

### 같은 네트워크의 다른 사람도 접속 가능하게 실행

프론트 개발 서버 자체를 같은 네트워크에 공개하려면:

```bash
cd prompt-experiment-studio/prompt-experiment-studio-fe
yarn dev --host 0.0.0.0 --port 5173
```

다른 PC에서는 아래처럼 프론트를 연 사람의 IP로 접속:

```text
http://<프론트_실행_PC_IP>:5173
```

주의:

- 프론트의 API 주소는 `127.0.0.1:8000`으로 고정되어 있습니다.
- 그래서 다른 PC에서 프론트에 접속해도, 백엔드 호출까지 함께 쓰려면 별도 주소 변경 작업이 필요합니다.

## 주의사항

- 백엔드 가상환경은 `prompt-experiment-studio-be/.venv`만 사용합니다.
- 루트 폴더의 다른 가상환경과 섞어 쓰면 의존성 충돌이 날 수 있습니다.
- 같은 네트워크에서 접속할 때는 방화벽과 공유기 정책에 따라 포트 접근이 막힐 수 있습니다.
