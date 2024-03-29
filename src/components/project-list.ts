import {DragTarget} from '../models/drag-drop';
import 컴포넌트 from './base-components';
import { Project, ProjectStatus } from "../models/project";
import {자동바인드} from "../decorators/autobind"
import { projectState } from '../state/project-states';
import { ProjectItem } from './project-item';

    // ProjectList Class
 export class ProjectList extends 컴포넌트<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];
  
    constructor(private type: 'active'|'finished') {
      super('project-list', 'app', false, `${type}-projects`);
      this.assignedProjects = [];
      this.configure();
      this.renderContent();
    }
  
    @자동바인드
    dragOverHandler(event: DragEvent): void {
      if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        event.preventDefault();
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add('droppable')
      }
    }
    
    @자동바인드
    dropHandler(event: DragEvent): void {
      const prjId = event.dataTransfer!.getData('text/plain');
      projectState.moveProject(prjId,
         this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }
  
    @자동바인드
    dragLeaveHandler(_: DragEvent): void {
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.remove('droppable')  
    }
  
    configure() {
      this.element.addEventListener('dragover', this.dragOverHandler);
      this.element.addEventListener('dragleave', this.dragLeaveHandler);
      this.element.addEventListener('drop', this.dropHandler);
  
      projectState.addListener((projects: Project[]) => {
        const releavantProjects = projects.filter(prj => {
          if(this.type === 'active') {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });
        this.assignedProjects = releavantProjects;
        this.renderProjects();
      });
    }
  
    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector('ul')!.id = listId;
      this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }
  
    private renderProjects() {
      const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
      listEl.innerHTML = '';
      for (const prjItem of this.assignedProjects) {
        // const listItem = document.createElement('li');
        // listItem.textContent = prjItem.title;
        // listEl?.appendChild(listItem);
        new ProjectItem(this.element.querySelector('ul')!.id, prjItem)
      }
    }
  
  }
