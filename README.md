# Twitter Clone Server

트위터를 참고해서 백엔드 기능을 구현했습니다. 사용한 기술은 아래와 같습니다.

- 언어: TypeScript
- 주요 라이브러리, 프레임워크: Express, mongoose, passport, passport-local

## 폴더 구조

```
project
└───src
│      app.ts
│      index.ts
└──────────api
│   │──────auth
│   │       auth.controller.ts
│   │       auth.interface.ts
│   │       auth.service.ts
│   │
│   │──────reading
│   │       reading.controller.ts
│   │       reading.interface.ts
│   │       reading.service.ts
│   │
│   │──────tweet
│   │       tweet.controller.ts
│   │       tweet.interface.ts
│   │       tweet.service.ts
│   │
│   │──────user
│   │       user.controller.ts
│   │       user.interface.ts
│   │       user.service.ts
│   │
└───────middlewares
│   │       authority.ts
│   │       database.ts
│   │       multerS3.ts
│   │       passportConfig.ts
└───────models
│   │       mediaSchema.ts
│   │       TimeLine.ts
│   │       Tweet.ts
│   │       User.ts
└───────routes
│   │       index.ts
│   │       auth.ts
│   │       reading.ts
│   │       tweet.ts
└───────utils
│   │       createError.ts
│   │       debugger.ts
│   │       getRandomString.ts
│   │       tweet.ts
```

## API 설계 방식

요청과 응답을 처리하는 `controller`, 데이터베이스와 연동해서 데이터를 생성, 조회, 수정, 삭제하는 `service`, 그리고 인터페이스 정의를 모은 `interface`로 구성하고 있습니다. 작동하는 방식은 다음과 같습니다.

1. 클라이언트에서 api 를 호출합니다.
2. controller 에서 해당 요청을 인식합니다. request.body, request.params 등으로 api 수행에 필요한 정보를 읽어옵니다.
3. request 에서 얻은 정보를 매개값으로 service 메소드를 호출합니다.
4. service 에서는 데이터베이스에 접근해서 요청에 맞춰 데이터를 생성, 조회, 수정 또는 삭제를 합니다. 만약 조회가 목적이라면 조회한 데이터를 리턴합니다.
5. 다시 controller 로 이동해서 response 로 응답을 보냅니다. 만약 service 메소드가 특정 정보를 리턴한 경우 그 정보를 함께 전송합니다.

그리고 api 를 크게 기능별로 구분해서 폴더를 만들고 컨트롤러, 서비스, 인터페이스 파일을 작성했습니다.

- auth: 로그인, 회원가입 등 사용자의 인증과 관련이 있는 기능입니다.
- tweet: 트윗 생성, 삭제 그리고 트윗과 관련된 기능들(리트윗, 마음에 들어요, 답글)을 다룹니다.
- reading: 트윗들을 모은 타임라인을 읽는 역할입니다. 로그인한 사용자의 홈 타임라인, 특정 사용자의 타임라인, 그리고 특정 트윗을 읽는 기능을 다룹니다.
- user: 프로필 조회와 수정, 비밀번호 변경 등 사용자의 정보를 다루는 기능입니다. [진행중]

API 를 설계할 때 Node 프레임워크 [NestJS](https://nestjs.com/)를 참고해서 작성했습니다.

## API 목록

- GET `auth/logout`
- POST `auth/join`
- POST `auth/login`
- POST `auth/token-refresh`

- POST `tweet/create`
- POST `tweet/add-comment`
- PATCH `tweet/delete`
- PATCH `tweet/do-retweet`
- PATCH `tweet/undo-retweet`
- PATCH `tweet/do-like`
- PATCH `tweet/undo-like`
- PATCH `tweet/delete-comment`

- GET `reading/home`
- GET `reading/timeline/:userid`
- GET `reading/:tweetid`

- GET `user/follower-list`
- GET `user/following-list`
- GET `user/check-email-duplicate`
- GET `user/check-id-duplicate`
- PATCH `user/change-profile`
