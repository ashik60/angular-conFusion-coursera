import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';



import {Dish} from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  comment: Comment;
  commentForm: FormGroup;
  @ViewChild('cform') commentFormDirective;

  constructor(private dishService: DishService,
              private location: Location,
              private route: ActivatedRoute,
              private fb: FormBuilder) { }

  formErrors = {
    author: '',
    comment: ''
  };

  validationMessages = {
    author: {
      required: 'Name is required.',
      minlength: 'Name must be at least 2 characters long.',
      maxlength: 'Name cannot be more than 25 characters long.'
    },
    comment: {
      required: 'Comment is required.',
    },
  };

  createForm(): void {
    this.commentForm = this.fb.group({
      rating: 5,
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      comment: ['', Validators.required],
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = (new Date()).toISOString();
    this.dish.comments.push(this.comment);
    this.commentForm.reset({
      rating: 5,
      author: '',
      comment: '',
    });
    this.commentFormDirective.resetForm();
  }

  ngOnInit(): void {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params.id)))
      .subscribe(dish => {
        this.dish = dish;
        this.setPrevNext(dish.id);
      });
    this.createForm();    
  }

  setPrevNext(dishID: string) {
    const index = this.dishIds.indexOf(dishID);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

}
