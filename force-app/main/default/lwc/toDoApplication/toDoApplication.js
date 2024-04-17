import { LightningElement, wire } from "lwc";
import loadIncompleteRecords from "@salesforce/apex/ToDoController.loadIncompleteRecords";
import loadCompleteRecords from "@salesforce/apex/ToDoController.loadCompleteRecords";
import {
  createRecord,
  deleteRecord,
  updateRecord
} from "lightning/uiRecordApi";
import TASK_MANAGER_OBJECT from "@salesforce/schema/Task_Manager__c";
import NAME_FIELD from "@salesforce/schema/Task_Manager__c.Name";
import Task_Date_FIELD from "@salesforce/schema/Task_Manager__c.Task_Date__c";
import Is_Completed_FIELD from "@salesforce/schema/Task_Manager__c.Is_Completed__c";
import ID_FIELD from "@salesforce/schema/Task_Manager__c.Id";
import Completion_Date_FIELD from "@salesforce/schema/Task_Manager__c.Completed_Date__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

export default class ToDoApplication extends LightningElement {
  taskname = "";
  taskdate = null;
  incompletedTasks = [];
  completedTasks = [];
  incompleteTaskResult;
  completeTaskResult;

  @wire(loadIncompleteRecords)
  wire_incompleteRecords(result) {
    this.incompleteTaskResult = result;
    let { data, error } = result;
    if (data) {
      console.log("Incomplete Task Records", data);
      this.incompletedTasks = data.map((currentItem) => ({
        taskId: currentItem.Id,
        taskname: currentItem.Name,
        taskdate: currentItem.Task_Date__c
      }));
      console.log("Incomplete Task Array", this.incompletedTasks);
    } else if (error) {
      console.log("Complete Task Records", error);
    }
  }

  @wire(loadCompleteRecords)
  wire_completedRecords(result) {
    this.completeTaskResult = result;
    let { data, error } = result;
    if (data) {
      console.log("Complete Task Records", data);
      this.completedTasks = data.map((currentItem) => ({
        taskId: currentItem.Id,
        taskname: currentItem.Name,
        taskdate: currentItem.Task_Date__c
      }));
      console.log("Complete Task Records", this.completedTasks);
    } else if (error) {
      console.log("Complete Task Records", error);
    }
  }

  changeHandler(event) {
    let { name, value } = event.target;
    if (name === "taskname") {
      this.taskname = value;
    } else if (name === "taskdate") {
      this.taskdate = value;
    }
    console.log(" Task Name: " + this.taskname);
    console.log(" Task Date: " + this.taskdate);
  }

  resetHandler() {
    this.taskname = "";
    this.taskdate = null;
  }

  addTaskHandler() {
    console.log(this.validateTask());
    //If task's end date is missing, set end date as today's date.
    if (!this.taskdate) {
      this.taskdate = new Date().toISOString().slice(0, 10);
    }

    if (this.validateTask()) {
      let inputFields = {};
      inputFields[NAME_FIELD.fieldApiName] = this.taskname;
      inputFields[Task_Date_FIELD.fieldApiName] = this.taskdate;
      inputFields[Is_Completed_FIELD.fieldApiName] = false;

      let recordInput = {
        apiName: TASK_MANAGER_OBJECT.objectApiName,
        fields: inputFields
      };
      createRecord(recordInput).then((result) => {
        console.log("Record Created Successfully", result);
        this.showToast(
          "Task Created",
          "Task has been created successfully",
          "success"
        );
        this.resetHandler();
        refreshApex(this.incompleteTaskResult);
      });
    }
  }

  validateTask() {
    let isValid = true;
    let element = this.template.querySelector(".taskname");
    if (!this.taskname) {
      isValid = false;
    } else {
      let taskItem = this.incompletedTasks.find(
        (currentItem) =>
          currentItem.taskname === this.taskname &&
          currentItem.taskdate === this.taskdate
      );
      if (taskItem) {
        isValid = false;
        element.setCustomValidity("Task is already added");
      }
    }
    if (isValid) {
      element.setCustomValidity("");
    }
    element.reportValidity();
    return isValid;
  }

  sortTasks(inputArray) {
    let sortedArray = inputArray.sort((a, b) => {
      const dateA = new Date(a.taskdate);
      const dateB = new Date(b.taskdate);
      return dateA - dateB;
    });
    return sortedArray;
  }

  removeHandler(event) {
    //remove the entry from the incompletedTasks array and sort it again.
    let recordId = event.target.name;
    deleteRecord(recordId)
      .then(() => {
        this.showToast("Task Deleted", "Task has been deleted", "success");
        refreshApex(this.incompleteTaskResult);
      })
      .catch((error) => {
        this.showToast("Error", "Task could not be deleted", error);
      });
  }

  completeTaskHandler(event) {
    let recordId = event.target.name;
    this.refereshData(recordId);
  }

  dragStartHandler(event) {
    event.dataTransfer.setData("text", event.target.dataset.item);
  }

  allowDrop(event) {
    event.preventDefault();
  }

  dropElementhandler(event) {
    let recordId = event.dataTransfer.getData("text");
    this.refereshData(recordId);
  }

  async refereshData(recordId) {
    let inputFields = {};
    inputFields[ID_FIELD.fieldApiName] = recordId;
    inputFields[Is_Completed_FIELD.fieldApiName] = true;
    inputFields[Completion_Date_FIELD.fieldApiName] = new Date()
      .toISOString()
      .slice(0, 10);
    let recordInput = {
      fields: inputFields
    };
    try {
      await updateRecord(recordInput);
      await refreshApex(this.incompleteTaskResult);
      await refreshApex(this.completeTaskResult);
      this.showToast(
        "Task Completed",
        "Task has been Updated successfully",
        "success"
      );
    } catch (error) {
      console.log("Update operation failed", error);
      this.showToast(
        "Task Completion Failed",
        "Task could not be updated",
        "error"
      );
    }
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }
}
