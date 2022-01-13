# Witter Server 2.0

## 개요

로그인 및 인증, 트윗 작성, 타임라인 등 트위터의 일부 기능을 직접 구현하며 공부하는 것이 목적인 애플리케이션입니다.

Express, MongoDB 으로 작성한 [기존의 프로젝트](https://github.com/chinsanchung/witter-server/tree/main) 대신, NestJS 그리고 SQL 으로 개발하고 있습니다.

어떤 과정을 거쳐 개발을 하고 있는지 그 내용을 [what_I_did.md](https://github.com/chinsanchung/witter-server/blob/2.0/develop/what_I_did.md)에 기록하고 있습니다.

### 목표

- Express 대신 NestJS 를 사용합니다.
  - NestJs 의 종속성 주입(Dependency Injection) 디자인 패턴을 가지고 있어 코드의 가독성이 높습니다.
  - 모의 객체(모듈)으로 보다 편리하게 테스트를 수행할 수 있습니다.
- MongoDB 대신 SQL 을 사용합니다. 초기에는 SQLite3 으로, 마무리가 될 즈음에는 AWS RDS for MySQL 으로 변경합니다.
- TDD 를 의식하여, 유닛 테스트 케이스를 우선 작성한 후에 비즈니스 로직을 생성합니다.

## 개발 환경

- 언어: TypeScript
- 데이터베이스: SQLite3
- 사용 도구: NestJs, bcrypt, class-validator, passport, passport-jwt, sqlite3, typeorm
