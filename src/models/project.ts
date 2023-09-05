// 프로젝트 타입
namespace App {

    export enum ProjectStatus { Active, Finished }

    export class Project {
      constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
      ) {
    
      }
    }
}    
